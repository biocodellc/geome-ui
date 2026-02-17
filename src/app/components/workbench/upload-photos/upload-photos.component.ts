import { Component, inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged, finalize, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { PhotoService } from '../../../../helpers/services/photo.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

type UploadUiError = {
  status: number;
  title: string;
  body: string;
  details: string[];
  retryable: boolean;
};

@Component({
  selector: 'app-upload-photos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upload-photos.component.html',
  styleUrl: './upload-photos.component.scss'
})
export class UploadPhotosComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder);
  photoService = inject(PhotoService);
  private modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  expeditionService = inject(ExpeditionService);

  // Variables
  destroy$:Subject<any> = new Subject();
  photoEntities:Array<any> = [];
  expeditions:Array<any> = [];
  permittedExpeditionCodes:Set<string> = new Set<string>();
  permissionCheckReady:boolean = false;
  loading: boolean = false;
  currentUser:any;
  currentProject:any;

  // Other Variables
  @ViewChild('warning_modal', { static: false }) userWarningModalRef!:TemplateRef<any>;
  @ViewChild('result_modal', { static: false }) uploadResultModalRef!:TemplateRef<any>;
  photoForm!:FormGroup;
  file!:File;
  selectedEntity:any;
  uploadProgress:number = 0;
  canResume: boolean = false;
  uploadState:'idle' | 'uploading' | 'success' | 'error' = 'idle';
  uploadStatusMessage:string = '';
  uploadErrors:string[] = [];
  uploadWarnings:string[] = [];
  uploadErrorInfo:UploadUiError | null = null;

  constructor(){
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> {
      this.currentUser = res;
      if (this.currentProject?.projectId) this.getUserExpeditions();
    });
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
      this.ensurePhotoEntitiesLoaded();
      this.getUserExpeditions();
    });
  }

  initForm(){
    this.photoForm = this.fb.group({
      entity: ['', Validators.required],
      expedition: [''],
      ignoreId: [false],
      fileName: ['', Validators.required]
    })
    this.form['ignoreId'].valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((val:boolean)=>{
      if(val) this.setReqValidator('ignoreId');
      else this.setReqValidator('ignoreId', false);
    })
    this.form['entity'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val:string)=>{
      this.selectedEntity = this.photoEntities.find((entity:any)=> entity.conceptAlias == val);
      this.setReqValidator('expedition', !!this.selectedEntity?.requiresExpedition);
      if (!this.selectedEntity?.requiresExpedition) this.setControlVal('expedition', '');
      this.resetUploadState();
    })
  }

  setPhotoEntities() {
    const entities = this.currentProject?.config?.entities || [];
    if (!entities.length) {
      this.photoEntities = [];
      return;
    }

    this.photoEntities = entities
      .filter((e:any) => e.type === 'Photo')
      .map((e:any) => {
        const parentEntity = entities.find(
          (p:any) => p.conceptAlias === e.parentEntity,
        );

        const excludeCols = ['originalUrl', 'photoID', parentEntity.uniqueKey];

        return {
          conceptAlias: e.conceptAlias,
          parentEntity: e.parentEntity,
          generateID: e.generateID,
          uniqueAcrossProject: !!parentEntity.uniqueAcrossProject,
          additionalMetadata: e.attributes.filter(
            (a:any) => !a.internal && !excludeCols.includes(a.column),
          ),
          requiresExpedition: !parentEntity.uniqueAcrossProject,
        };
      });
    if (this.photoEntities.length)
      this.setControlVal('entity', this.photoEntities[0].conceptAlias);
  }

  private ensurePhotoEntitiesLoaded(): void {
    if (this.currentProject?.config?.entities?.length) {
      this.setPhotoEntities();
      return;
    }

    this.projectService.getAllProjects(true).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (projects:any) => {
        const projectFromList = (projects || []).find((item:any) => item?.projectId == this.currentProject?.projectId) || this.currentProject;
        this.projectService.getProjectConfig(projectFromList).pipe(take(1), takeUntil(this.destroy$)).subscribe({
          next: (config:any) => {
            this.currentProject = { ...projectFromList, config };
            this.setPhotoEntities();
          },
          error: () => {
            this.setPhotoEntities();
          }
        });
      },
      error: () => {
        this.setPhotoEntities();
      }
    });
  }

  getUserExpeditions(){
    if (!this.currentProject?.projectId) return;

    const projectOwnerId = this.currentProject?.user?.userId;
    const isProjectOwner = projectOwnerId && this.currentUser?.userId === projectOwnerId;
    const enforceAccess = !!this.currentProject?.enforceExpeditionAccess && !isProjectOwner;
    const expeditionReq$ = enforceAccess
      ? this.expeditionService.getExpeditionsForUser(this.currentProject.projectId, true)
      : this.expeditionService.getAllExpeditions(this.currentProject.projectId);

    expeditionReq$.pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next:(res:any)=>{
        this.expeditions = res || [];
        this.permittedExpeditionCodes = new Set(
          this.expeditions
            .map((item:any) => item?.expeditionCode)
            .filter((code:any) => !!code),
        );
        this.permissionCheckReady = true;

        const selectedExpedition = this.expeditions.find((item:any)=> item.expeditionTitle == this.getControlVal('expedition'));
        if (this.getControlVal('expedition') && !selectedExpedition) this.setControlVal('expedition', '');
      },
      error:()=>{
        this.expeditions = [];
        this.permittedExpeditionCodes.clear();
        this.permissionCheckReady = false;
      }
    })
  }

  async verifyValidations() {
    if (this.loading) return;

    // Checking Forms Validations
    this.photoForm.markAllAsTouched();
    if(this.photoForm.invalid) return;

    // Checking other Validations
    const expedition = this.expeditions.find((item:any)=> item.expeditionTitle == this.getControlVal('expedition'));
    if (
      !this.file ||
      !this.selectedEntity ||
      !this.getControlVal('entity') ||
      (this.selectedEntity?.requiresExpedition && !expedition?.expeditionCode)
    )
      return;

    this.upload();
  }

  openModal(content: TemplateRef<any>){
    this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  async upload(){
    const expedition = this.expeditions.find((item:any)=> item.expeditionTitle == this.getControlVal('expedition'));

    this.uploadProgress = 0;
    this.loading = true;
    this.uploadState = 'uploading';
    this.uploadStatusMessage = `Uploading ${this.getEntityLabel()} photos...`;
    this.uploadErrors = [];
    this.uploadWarnings = [];
    this.uploadErrorInfo = null;

    const resume = !!this.canResume;
    this.canResume = false;

    this.uploadStatusMessage = 'Checking upload permission...';

    this.authService.ensureActiveSession().pipe(
      switchMap(() =>
        this.photoService.precheck(
          this.currentProject.projectId,
          expedition?.expeditionCode,
          this.selectedEntity.conceptAlias,
        )
      ),
      switchMap((precheck:any) => {
        if (precheck?.allowed === false) {
          return throwError(() => ({
            error: {
              usrMessage: precheck?.message || 'Upload permission check failed.',
              developerMessage: '',
              httpStatusCode: 403,
            },
            status: 403
          }));
        }

        this.uploadStatusMessage = `Uploading ${this.getEntityLabel()} photos...`;
        return this.photoService.upload(
          this.currentProject.projectId,
          expedition?.expeditionCode,
          this.selectedEntity.conceptAlias,
          this.file,
          resume,
          this.getControlVal('ignoreId'),
          progress => {
            this.uploadProgress = progress.percent;
            this.uploadStatusMessage = `Uploading ${this.getEntityLabel()} photos... ${progress.percent}%`;
          }
        );
      }),
    )
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (res:any) => {
        this.uploadWarnings = this.normalizeMessages(res?.warnings);
        const normalizedErrors = this.normalizeMessages(res?.errors);
        if (res?.success && !normalizedErrors.length) {
          this.uploadProgress = 100;
          this.uploadState = 'success';
          this.uploadStatusMessage = `${this.getEntityLabel()} photo upload completed successfully.`;
        } else {
          this.uploadState = 'error';
          this.uploadProgress = 0;
          this.uploadErrorInfo = {
            status: 422,
            title: 'Invalid Photo Package',
            body: 'Archive accepted, but validation failed for one or more files.',
            details: normalizedErrors.length
              ? normalizedErrors
              : ['Photo upload failed. Please review your file and try again.'],
            retryable: false,
          };
          this.uploadErrors = this.uploadErrorInfo.details;
          this.uploadStatusMessage = `${this.getEntityLabel()} photo upload failed.`;
        }
      },
      error: (err:any) => {
        this.uploadState = 'error';
        this.uploadProgress = 0;
        this.uploadWarnings = [];
        this.uploadErrorInfo = this.mapUploadError(err, { hasExpeditionCode: !!expedition?.expeditionCode });
        this.uploadErrors = this.uploadErrorInfo.details;
        this.uploadStatusMessage = `${this.uploadErrorInfo.title}: ${this.uploadErrorInfo.body}`;
      }
    })
  }

  onFileSelect(event:any){
    this.file = event.target.files[0];
    this.setControlVal('fileName', this.file?.name || '');
    this.resetUploadState();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }


  // Helper Functions
  get form(){ return this.photoForm.controls; }

  getControlVal(control:string){ return this.form[control].value };

  setControlVal(control:string, val:any){
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  };

  setReqValidator(control:string, setErr:boolean = true){
    this.form[control].setValidators(setErr ? [Validators.required] : []);
    this.form[control].updateValueAndValidity();
  }

  private getEntityLabel():string {
    return (this.getControlVal('entity') || this.selectedEntity?.conceptAlias || 'Selected')
      .toString()
      .replace('_Photo', '')
      .replace('_', ' ');
  }

  private resetUploadState():void {
    this.uploadState = 'idle';
    this.uploadStatusMessage = '';
    this.uploadErrors = [];
    this.uploadWarnings = [];
    this.uploadProgress = 0;
    this.uploadErrorInfo = null;
  }

  private mapUploadError(err:any, opts:{ hasExpeditionCode?: boolean } = {}): UploadUiError {
    const payload = err?.error || {};
    const status = Number(payload?.httpStatusCode ?? err?.status ?? 0);
    const usrMessages = [
      ...this.normalizeMessages(payload?.usrMessage),
      ...this.normalizeMessages(payload?.message),
      ...this.normalizeMessages(payload?.errors),
    ];
    const devMessages = this.normalizeMessages(payload?.developerMessage);

    const withDetail = (base: Omit<UploadUiError, 'details'>, includeUsr = false, includeDev = false): UploadUiError => {
      const details:string[] = [];
      if (includeUsr) details.push(...usrMessages);
      if (includeDev) details.push(...devMessages.map(msg => `Developer: ${msg}`));
      return {
        ...base,
        body: this.getPreferredUserBody(base.body, usrMessages),
        details: [...new Set(details)],
      };
    };

    if (status === 400) {
      return withDetail({
        status,
        title: 'Upload Request Invalid',
        body: 'The upload request is missing required parameters or contains invalid values.',
        retryable: false,
      }, false, true);
    }

    if (status === 401) {
      return withDetail({
        status,
        title: 'Sign In Required',
        body: 'Your session expired or access token is invalid. Please sign in again.',
        retryable: true,
      }, false, true);
    }

    if (status === 403) {
      const expeditionDetail = opts.hasExpeditionCode
        ? ['With expeditionCode set, you must be expedition owner or project owner.']
        : [];
      const result = withDetail({
        status,
        title: 'Permission Denied',
        body: 'You do not have permission to upload this photo package.',
        retryable: false,
      }, true, true);
      result.details = [...new Set([...expeditionDetail, ...result.details])];
      return result;
    }

    if (status === 404) {
      return withDetail({
        status,
        title: 'Endpoint Not Found',
        body: 'Upload endpoint was not found. Check API base URL and route.',
        retryable: false,
      });
    }

    if (status === 413) {
      return withDetail({
        status,
        title: 'File Too Large',
        body: 'The archive is too large for server/proxy limits. Reduce zip size and retry.',
        retryable: true,
      }, false, true);
    }

    if (status === 415) {
      const result = withDetail({
        status,
        title: 'Unsupported File Type',
        body: 'Upload must be a raw ZIP stream, not multipart/form-data.',
        retryable: false,
      }, false, true);
      result.details = [
        'Expected Content-Type: application/zip, application/octet-stream, application/x-zip-compressed, or application/x-zip.',
        ...result.details,
      ];
      return result;
    }

    if (status === 422) {
      return withDetail({
        status,
        title: 'Invalid Photo Package',
        body: 'Archive accepted, but validation failed for one or more files.',
        retryable: false,
      }, true, true);
    }

    if (status === 429) {
      return withDetail({
        status,
        title: 'Too Many Requests',
        body: 'Upload rate limit reached. Please wait and retry.',
        retryable: true,
      }, false, true);
    }

    if ([500, 502, 503, 504].includes(status)) {
      return withDetail({
        status,
        title: 'Server Error',
        body: 'The server could not complete the upload. Please retry in a moment.',
        retryable: true,
      }, false, true);
    }

    const fallbackDetails = [
      ...usrMessages,
      ...devMessages.map(msg => `Developer: ${msg}`),
    ];
    if (!fallbackDetails.length && status) fallbackDetails.push(`HTTP status: ${status}`);
    if (!fallbackDetails.length) fallbackDetails.push(...this.normalizeMessages(err?.message));

    return {
      status,
      title: 'Upload Failed',
      body: this.getPreferredUserBody('An unexpected error occurred during upload.', usrMessages),
      details: [...new Set(fallbackDetails)],
      retryable: status === 0 || status >= 500,
    };
  }

  private getPreferredUserBody(defaultBody:string, usrMessages:string[]): string {
    const messages = (usrMessages || []).filter(Boolean);
    const genericMessages = new Set([
      'server error',
      'bad request',
      'forbidden',
      'unauthorized',
      'internal server error',
      'an error occurred',
    ]);
    const nonGeneric = messages.find((msg:string) => !genericMessages.has(msg.trim().toLowerCase()));
    return nonGeneric || messages[0] || defaultBody;
  }

  private normalizeMessages(value:any): string[] {
    const out:string[] = [];
    const push = (msg:string) => {
      const cleaned = msg?.trim();
      if (cleaned && !out.includes(cleaned)) out.push(cleaned);
    };

    const walk = (entry:any) => {
      if (entry === null || entry === undefined) return;

      if (typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
        push(String(entry));
        return;
      }

      if (Array.isArray(entry)) {
        entry.forEach(item => walk(item));
        return;
      }

      if (typeof entry === 'object') {
        const preferred = ['usrMessage', 'message', 'developerMessage', 'error', 'detail'];
        preferred.forEach((key:string) => {
          if (entry[key] !== undefined && entry[key] !== null) walk(entry[key]);
        });

        const remainingEntries = Object.entries(entry).filter(([key]) => !preferred.includes(key));
        if (remainingEntries.length) {
          remainingEntries.forEach(([key, val]) => {
            if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
              push(`${key}: ${val}`);
            } else if (Array.isArray(val)) {
              const vals = this.normalizeMessages(val).join(', ');
              if (vals) push(`${key}: ${vals}`);
            }
          });
        }
      }
    };

    walk(value);
    return out;
  }
}

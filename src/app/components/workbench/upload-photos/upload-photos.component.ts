import { Component, inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, distinctUntilChanged, finalize, forkJoin, map, of, Subject, switchMap, take, takeUntil, throwError } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ProjectAccess, ProjectAccessService, sameUserId } from '../../../../helpers/services/project-access.service';
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
  accessService = inject(ProjectAccessService);

  // Variables
  destroy$:Subject<any> = new Subject();
  photoEntities:Array<any> = [];
  expeditions:Array<any> = [];
  permittedExpeditionCodes:Set<string> = new Set<string>();
  permissionCheckReady:boolean = false;
  expeditionsLoading = true;
  expeditionLoadError = '';
  uploadPermissionExplanation = '';
  selectionPermissionError = '';
  accessibleExpeditionCount = 0;
  private loadedAccessKey = '';
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
    this.accessService.context$.pipe(
      switchMap(access => {
        const key = this.accessKey(access);
        if (key !== this.loadedAccessKey) {
          this.photoEntities = [];
          this.selectedEntity = undefined;
          this.photoForm.patchValue({ entity: '', expedition: '' });
        }
        this.currentUser = access.user;
        this.currentProject = access.project;
        this.permissionCheckReady = false;
        this.expeditions = [];
        this.permittedExpeditionCodes.clear();
        this.accessibleExpeditionCount = 0;
        this.expeditionLoadError = '';
        this.uploadPermissionExplanation = '';
        this.selectionPermissionError = '';
        this.expeditionsLoading = access.loading;
        if (access.loading) return of(null);
        if (access.error || !access.isMember) {
          this.uploadPermissionExplanation = access.error || 'Only verified project members or the project owner can upload photos.';
          return of(null);
        }
        this.expeditionsLoading = true;
        const config$ = access.project.config?.entities?.length
          ? of(access.project.config)
          : this.projectService.getProjectConfig(access.project);
        return forkJoin({ items: this.expeditionService.getAccessibleExpeditions(access), config: config$.pipe(take(1)) }).pipe(
          map(result => ({ ...result, access })),
          catchError(error => {
            this.expeditionsLoading = false;
            if (error.status === 403) this.uploadPermissionExplanation = 'The server denied access to this project’s expeditions. Contact the project owner for access.';
            else this.expeditionLoadError = 'Unable to load photo upload options. Please retry.';
            return of(null);
          })
        );
      }), takeUntil(this.destroy$)
    ).subscribe(result => {
      if (!result) return;
      this.expeditionsLoading = false;
      if (!result.config?.entities) {
        this.expeditionLoadError = 'Unable to load the project’s photo configuration. Please retry.';
        return;
      }
      this.currentProject = { ...result.access.project, config: result.config };
      this.loadedAccessKey = this.accessKey(result.access);
      this.accessibleExpeditionCount = result.items.length;
      this.expeditions = result.items.filter(item => item.expeditionCode && this.canUploadToExpedition(result.access, item));
      this.permittedExpeditionCodes = new Set(this.expeditions.map(item => item.expeditionCode));
      this.permissionCheckReady = true;
      this.setPhotoEntities();
      this.updateExpeditionRequirement();
      if (this.getControlVal('expedition') && !this.permittedExpeditionCodes.has(this.getControlVal('expedition'))) {
        this.setControlVal('expedition', '');
      }
      if (!this.accessControlKnown(result.access) && !sameUserId(result.access.user, result.access.project.user)) {
        this.uploadPermissionExplanation = 'The project’s photo upload access rules are unavailable. Please retry or contact the project owner.';
      } else if (this.accessEnforced(result.access)) {
        this.uploadPermissionExplanation = 'Expedition access control is on. Photo uploads to an expedition require expedition ownership or project ownership. Uploads spanning multiple expeditions require project ownership.';
      }
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
      this.updateExpeditionRequirement();
      this.setControlVal('expedition', '');
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

        if (!parentEntity) return null;
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
      }).filter(Boolean);
    if (this.photoEntities.length && !this.photoEntities.some(entity => entity.conceptAlias === this.getControlVal('entity')))
      this.setControlVal('entity', this.photoEntities[0].conceptAlias);
    else this.selectedEntity = this.photoEntities.find(entity => entity.conceptAlias === this.getControlVal('entity'));
  }

  getUserExpeditions(): void { this.accessService.retry(); }

  private accessKey(access: ProjectAccess): string {
    return `${access.user?.userId}/${access.project?.projectId}`;
  }

  private accessEnforced(access: ProjectAccess): boolean {
    return access.project?.enforceExpeditionAccess === true || access.project?.enforceExpeditionAccess === 'true';
  }

  private accessControlKnown(access: ProjectAccess): boolean {
    return [true, false, 'true', 'false'].includes(access.project?.enforceExpeditionAccess);
  }

  private verifiedAccess(access: ProjectAccess): boolean {
    return !access.loading && !access.error && access.isMember && sameUserId(access.user, access.user);
  }

  private canUploadToExpedition(access: ProjectAccess, expedition: any): boolean {
    if (!this.verifiedAccess(access)) return false;
    return sameUserId(access.user, access.project?.user) ||
      (this.accessControlKnown(access) && (!this.accessEnforced(access) || sameUserId(access.user, expedition.user)));
  }

  get canUploadAcrossExpeditions(): boolean {
    const access = this.accessService.current;
    return this.permissionCheckReady && this.verifiedAccess(access) && this.accessKey(access) === this.loadedAccessKey &&
      !!this.selectedEntity?.uniqueAcrossProject &&
      (sameUserId(access.user, access.project?.user) || (this.accessControlKnown(access) && !this.accessEnforced(access)));
  }

  get requiresExpeditionSelection(): boolean {
    return !!this.selectedEntity && (!this.selectedEntity.uniqueAcrossProject || !this.canUploadAcrossExpeditions);
  }

  get uploadUnavailable(): boolean {
    return !this.permissionCheckReady || this.expeditionsLoading || !!this.expeditionLoadError ||
      (!this.canUploadAcrossExpeditions && !this.expeditions.length);
  }

  private updateExpeditionRequirement(): void {
    this.setReqValidator('expedition', this.requiresExpeditionSelection);
  }

  private validateUploadAccess(): boolean {
    const access = this.accessService.current;
    const code = this.getControlVal('expedition');
    const expedition = this.expeditions.find(item => item.expeditionCode === code);
    const ready = this.permissionCheckReady && !this.expeditionsLoading && !this.expeditionLoadError &&
      this.verifiedAccess(access) && this.accessKey(access) === this.loadedAccessKey;
    if (!ready || (code ? !expedition || !this.canUploadToExpedition(access, expedition) : !this.canUploadAcrossExpeditions)) {
      this.selectionPermissionError = !ready
        ? 'Photo upload permissions are not ready. Please wait for loading to finish or retry.'
        : 'Select an expedition permitted by the photo upload rules. With access control on, you must own the expedition or project. Contact the project owner if you need access.';
      return false;
    }
    this.selectionPermissionError = '';
    return true;
  }

  async verifyValidations() {
    if (this.loading || !this.validateUploadAccess()) return;

    // Checking Forms Validations
    this.photoForm.markAllAsTouched();
    if(this.photoForm.invalid) return;

    // Checking other Validations
    const expedition = this.expeditions.find((item:any)=> item.expeditionCode === this.getControlVal('expedition'));
    if (
      !this.file ||
      !this.selectedEntity ||
      !this.getControlVal('entity') ||
      (this.requiresExpeditionSelection && !expedition?.expeditionCode)
    )
      return;

    this.upload();
  }

  openModal(content: TemplateRef<any>){
    this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  async upload(){
    if (this.loading || !this.validateUploadAccess() || this.photoForm.invalid || !this.file || !this.selectedEntity) return;
    const projectId = this.currentProject.projectId;
    const entityAlias = this.selectedEntity.conceptAlias;
    const expedition = this.expeditions.find((item:any)=> item.expeditionCode === this.getControlVal('expedition'));

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
          projectId,
          expedition?.expeditionCode,
          entityAlias,
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
          projectId,
          expedition?.expeditionCode,
          entityAlias,
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
    .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
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
        ? ['If expedition access control is on, photo uploads require expedition ownership or project ownership. If it is off, verified project members may upload.']
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

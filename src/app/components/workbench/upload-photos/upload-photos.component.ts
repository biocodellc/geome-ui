import { Component, inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged, finalize, Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { PhotoService } from '../../../../helpers/services/photo.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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

  constructor(){
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> {
      this.currentUser = res;
      if (this.currentProject?.projectId) this.getUserExpeditions();
    });
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
      this.setPhotoEntities();
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
    const { entities } = this.currentProject.config;
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
          additionalMetadata: e.attributes.filter(
            (a:any) => !a.internal && !excludeCols.includes(a.column),
          ),
          requiresExpedition: !parentEntity.uniqueAcrossProject,
        };
      });
    if (this.photoEntities.length)
      this.setControlVal('entity', this.photoEntities[0].conceptAlias);
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

    if (!this.hasExpeditionPermission(expedition)) {
      this.uploadState = 'error';
      this.uploadProgress = 0;
      this.uploadStatusMessage = 'Permission check failed.';
      this.uploadWarnings = [];
      this.uploadErrors = [
        'You do not have permission to upload photos for the selected expedition. Choose an expedition you own or contact the project owner.',
      ];
      return;
    }

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

    const resume = !!this.canResume;
    this.canResume = false;

    this.photoService.upload(
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
    )
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (res:any) => {
        this.uploadWarnings = res?.warnings || [];
        if (res?.success && !(res?.errors || []).length) {
          this.uploadProgress = 100;
          this.uploadState = 'success';
          this.uploadStatusMessage = `${this.getEntityLabel()} photo upload completed successfully.`;
        } else {
          this.uploadState = 'error';
          this.uploadProgress = 0;
          this.uploadErrors = (res?.errors || []).length
            ? res.errors
            : [`${this.getEntityLabel()} photo upload failed. Please review your file and try again.`];
          this.uploadStatusMessage = `${this.getEntityLabel()} photo upload failed.`;
        }
      },
      error: (err:any) => {
        this.uploadState = 'error';
        this.uploadProgress = 0;
        this.uploadWarnings = [];
        this.uploadErrors = this.getUploadErrorMessages(err);
        this.uploadStatusMessage = `${this.getEntityLabel()} photo upload failed.`;
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
  }

  private getUploadErrorMessages(err:any): string[] {
    const payload = err?.error || {};
    const status = Number(payload?.httpStatusCode ?? err?.status ?? 0);
    const userMessage = payload?.usrMessage || payload?.message || err?.message;
    const developerMessage = payload?.developerMessage;
    const messages:string[] = [];

    if (userMessage) messages.push(userMessage);

    if (status) {
      const interpreted = this.getHttpStatusMessage(status);
      if (interpreted) messages.push(`HTTP ${status}: ${interpreted}`);
      else messages.push(`HTTP ${status}: Upload request failed.`);
    }

    if (typeof developerMessage === 'string' && developerMessage.trim()) {
      messages.push(`Details: ${developerMessage.trim()}`);
    }

    if (!messages.length) {
      messages.push('Photo upload failed due to a server or network error.');
    }

    return [...new Set(messages)];
  }

  private getHttpStatusMessage(status:number): string {
    const statusMessages:Record<number, string> = {
      400: 'The upload request was invalid. Check required fields and file contents.',
      401: 'You are not authenticated. Please sign in again and retry.',
      403: 'You do not have permission to upload photos for this project or expedition.',
      404: 'The upload endpoint or related project resource was not found.',
      408: 'The upload timed out before completion. Please retry.',
      413: 'The file is too large for the server limit. Upload a smaller zip.',
      415: 'Unsupported media type. Upload a valid .zip file and verify the archive format.',
      422: 'The server could not process the upload content. Check file naming and metadata.',
      429: 'Too many requests. Wait briefly and try again.',
      500: 'Server error while processing the upload. Please retry shortly.',
      502: 'Bad gateway from an upstream service. Please retry shortly.',
      503: 'Upload service is temporarily unavailable. Please retry shortly.',
      504: 'Gateway timeout while processing upload. Please retry.',
    };

    return statusMessages[status] || '';
  }

  private hasExpeditionPermission(expedition:any): boolean {
    if (!this.currentProject?.enforceExpeditionAccess) return true;
    if (!this.selectedEntity?.requiresExpedition) return true;

    const projectOwnerId = this.currentProject?.user?.userId;
    const isProjectOwner = projectOwnerId && this.currentUser?.userId === projectOwnerId;
    if (isProjectOwner) return true;

    if (!this.permissionCheckReady) return false;
    if (!expedition?.expeditionCode) return false;
    return this.permittedExpeditionCodes.has(expedition.expeditionCode);
  }
}

import { Component, inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged, Subject, take, takeUntil } from 'rxjs';
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
  loading: boolean = false;
  currentUser:any;
  currentProject:any;

  // Other Variables
  @ViewChild('warning_modal', { static: false }) userWarningModalRef!:TemplateRef<any>;
  @ViewChild('result_modal', { static: false }) uploadResultModalRef!:TemplateRef<any>;
  photoForm!:FormGroup;
  file!:File;
  selectedEntity:any;
  uploadProgress: any;
  canResume: boolean = false;

  constructor(){
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res);
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
    this.form['entity'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val:string)=>
      this.selectedEntity = this.photoEntities.find((entity:any)=> entity.conceptAlias == val)
    )
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
    this.expeditionService.getAllExpeditions(this.currentProject.projectId).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next:(res:any)=>{
        if(res){
          this.expeditions = res;//.filter((item:any)=> this.currentUser.email == item.user.email);
        }
      },
      error:(err:any)=>{}
    })
  }

  async verifyValidations() {
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

    if (
      (this.currentProject.enforceExpeditionAccess &&
      this.currentProject.user.userId !== this.currentUser.userId)
    ) {
      this.openModal(this.userWarningModalRef);
    }
    else this.upload();
  }

  openModal(content: TemplateRef<any>){
    this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  async upload(){
    const expedition = this.expeditions.find((item:any)=> item.expeditionTitle == this.getControlVal('expedition'));

    this.uploadProgress = 0;
    this.loading = true;

    const resume = !!this.canResume;
    this.canResume = false;

    this.photoService.upload(
      this.currentProject.projectId,
      expedition?.expeditionCode,
      this.selectedEntity.conceptAlias,
      this.file,
      resume,
      this.getControlVal('ignoreId')
    )
    // .progress((event:any) => {
      //   this.uploadProgress = parseInt(String((100.0 * event.loaded) / event.total));
      // })
    .subscribe({
      next: (res:any) => {
        console.log('====res===',res);
        // this.showResultDialog(res);
      },
      complete: () => {
        if (!this.canResume) {
          this.uploadProgress = undefined;
        }
        this.loading = false;
      }
    })
  }

  onFileSelect(event:any){
    console.log('=====event====',event.target.files);
    this.file = event.target.files[0];
    this.setControlVal('fileName', this.file.name);
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
}

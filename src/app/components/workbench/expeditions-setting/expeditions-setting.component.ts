import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-expeditions-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgbNavModule],
  templateUrl: './expeditions-setting.component.html',
  styleUrl: './expeditions-setting.component.scss'
})
export class ExpeditionsSettingComponent implements OnDestroy{
  // Injectors
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modalService = inject(NgbModal);
  private toastrService = inject(ToastrService);
  private projectService = inject(ProjectService);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthenticationService);
  private expeditionService = inject(ExpeditionService);
  private dummyDataService = inject(DummyDataService);

  // Variables
  private destroy$ = new Subject<void>();
  activeTab:string = 'settings';
  currentUser:any;
  currentProject:any;
  currentExpedition:any;
  expeditionStats:any;
  currentExpeditionId:string = '';
  projectExpeditions:Array<any> = [];
  expeditionForm!:FormGroup;
  modalRef!:NgbModalRef;
  metaDataList:any[] = [];

  constructor() {
    this.dummyDataService.loadingState.next(true);
    this.initForm();
    this.activatedRoute.params.pipe(take(1)).subscribe((res:any)=> this.currentExpeditionId = res?.id);
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res: any) => this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.currentProject = res;
        this.metaDataList = this.currentProject.config.expeditionMetadataProperties;
        this.metaDataList.forEach((item:any) => this.addControl(item.name, item.required));
        this.getProjectExpeditions();
      }
    })
  }

  initForm(){
    this.expeditionForm = this.fb.group({
      expeditionTitle: ['', Validators.required],
      visibility: ['', Validators.required]
    })
  }

  get form(){
    return this.expeditionForm.controls;
  }

  openDeleteModal(content: TemplateRef<any>){
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  getProjectExpeditions() {
    this.expeditionService.getExpeditionsForUser(this.currentProject.projectId, true).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res){
          this.projectExpeditions = res.filter((exp: any) => exp.user.username == this.currentUser.username);
          this.currentExpedition = this.projectExpeditions.filter((exp:any)=> exp.expeditionId == this.currentExpeditionId)[0];
          if(this.currentExpedition){
            this.getExpeditionStats();
            const allMetaDataControls = this.metaDataList.map(item => item.name);
            ['expeditionTitle', 'visibility', ...allMetaDataControls].forEach(key =>{
              const val = !allMetaDataControls.includes(key) ? this.currentExpedition[key] : this.currentExpedition.metadata[key];
              this.form[key].setValue(val);
              this.form[key].updateValueAndValidity();
            })
            this.dummyDataService.loadingState.next(false);
          }
        }
      },
      error: (err: any) => this.dummyDataService.loadingState.next(false)
    })
  }

  getExpeditionStats(){
    this.expeditionService.stats(this.currentProject.projectId, this.currentExpedition.expeditionId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.expeditionStats = res;
      }
    })
  }

  updateExpedition(){
    this.expeditionForm.markAllAsTouched();
    if(this.expeditionForm.invalid) return;
    this.dummyDataService.loadingState.next(true)
    const data = { ...this.expeditionForm.value };
    const metadata:any = {};
    this.metaDataList.forEach((item:any) =>{
      if(data[item.name] || data[item.name] == false) metadata[item.name] = data[item.name];
      delete data[item.name];
    })
    const updatedData = { ...this.currentExpedition, ...data, metadata };
    this.expeditionService.updateExpedition(this.currentProject.projectId, updatedData).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.toastrService.success('Updated Successfully.');
        this.dummyDataService.loadingState.next(false)
      },
      error: (err:any)=> this.dummyDataService.loadingState.next(false)
    })
  }

  deleteExpedition(){
    this.expeditionService.deleteExpedition(this.currentProject.projectId, this.currentExpedition)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res){
          this.toastrService.success('Expedition Deleted!');
          this.modalRef.close();
          this.router.navigate(['/workbench','expeditions']);
        }
      }
    })
  }

  addControl(control:string, required:boolean){
    this.expeditionForm.addControl(control, this.fb.control('', required ? Validators.required : []));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

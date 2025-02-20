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

  // Variables
  private destroy$ = new Subject<void>();
  isLoading:boolean = true;
  activeTab:string = 'settings';
  currentUser:any;
  currentProject:any;
  currentExpedition:any;
  expeditionStats:any;
  currentExpeditionId:string = '';
  projectExpeditions:Array<any> = [];
  expeditionForm!:FormGroup;
  modalRef!:NgbModalRef;

  constructor() {
    this.initForm();
    this.activatedRoute.params.pipe(take(1)).subscribe((res:any)=> this.currentExpeditionId = res?.id);
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res: any) => this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        this.currentProject = res;
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
            ['expeditionTitle', 'visibility'].forEach(key =>{
              this.form[key].setValue(this.currentExpedition[key]);
              this.form[key].updateValueAndValidity();
            })
            console.log('======current expedition======',this.currentExpedition);
          }
        }
      },
      error: (err: any) => this.isLoading = false
    })
  }

  getExpeditionStats(){
    this.expeditionService.stats(this.currentProject.projectId, this.currentExpedition.expeditionId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.expeditionStats = res;
        this.isLoading = false
      },
      error: (err:any)=> this.isLoading = false
    })
  }

  updateExpedition(){
    this.expeditionForm.markAllAsTouched();
    if(this.expeditionForm.invalid) return;
    this.isLoading = true;
    const updatedData = { ...this.currentExpedition, ...this.expeditionForm.value };
    this.expeditionService.updateExpedition(this.currentProject.projectId, updatedData).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.toastrService.success('Updated Successfully.');
        this.isLoading = false;
      },
      error: (err:any)=> this.isLoading = false
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

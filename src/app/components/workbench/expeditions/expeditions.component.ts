import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Router, RouterLink } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-expeditions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './expeditions.component.html',
  styleUrl: './expeditions.component.scss'
})
export class ExpeditionsComponent implements OnDestroy{
  // Injectors
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private modalService = inject(NgbModal);
  private toastrService = inject(ToastrService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthenticationService);
  private expeditionService = inject(ExpeditionService);

  // Variables
  private destroy$ = new Subject<void>();
  currentUser:any;
  currentProject:any;
  isLoading:boolean = true;
  projectExpeditions:Array<any> = [];
  modalRef!:NgbModalRef;

  // Modal Variables
  expeditionForm!:FormGroup;

  constructor(){
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        this.currentProject = res;
        this.getProjectExpeditions();
      }
    })
  }

  getProjectExpeditions(){
    this.expeditionService.getExpeditionsForUser(this.currentProject.projectId, true).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.isLoading = false;
        if(res) this.projectExpeditions = res.filter((exp:any) => exp.user.username == this.currentUser.username)
      },
      error: (err:any)=> this.isLoading = false
    })
  }

  openCreateModal(content: TemplateRef<any>){
    this.initForm();
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  get form(){
    return this.expeditionForm.controls;
  }

  initForm(){
    this.expeditionForm = this.fb.group({
      expeditionCode: ['', [Validators.required, Validators.minLength(4)]],
      expeditionTitle: ['', [Validators.required]],
      metadata: [{}],
      public: [true],
      visibility: ['anyone']
    })
  }

  createNew(){
    this.expeditionForm.markAllAsTouched();
    if(this.expeditionForm.invalid) return;
    this.isLoading = true;
    this.expeditionService.createExpedition(this.currentProject.projectId, this.expeditionForm.value)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res){
          this.toastrService.success('Expedition Created.')
          this.projectExpeditions.push(res);
          this.isLoading = false;
          this.modalRef.close();
        }
      },
      error: (err:any)=> this.isLoading = false
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

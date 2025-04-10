import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { RouterLink } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateExpeditionComponent } from '../../../dialogs/create-expedition/create-expedition.component';

@Component({
  selector: 'app-expeditions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './expeditions.component.html',
  styleUrl: './expeditions.component.scss'
})
export class ExpeditionsComponent implements OnDestroy{
  // Injectors
  private fb = inject(FormBuilder);
  private modalService = inject(NgbModal);
  private projectService = inject(ProjectService);
  private authService = inject(AuthenticationService);
  private expeditionService = inject(ExpeditionService);

  // Variables
  private destroy$ = new Subject<void>();
  currentUser:any;
  currentProject:any;
  isLoading:boolean = true;
  codeExists:boolean = true;
  projectExpeditions:Array<any> = [];
  modalRef!:NgbModalRef;
  codeRegex:any = /^[a-zA-Z0-9_]{4,50}$/;

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

  openCreateModal(){
    this.modalRef = this.modalService.open(CreateExpeditionComponent, { animation: true, centered: true, backdrop: false });
    this.modalRef.componentInstance.currentProject = { ...this.currentProject };
    this.modalRef.result.then((res:boolean)=>{
      if(res) this.getProjectExpeditions();
    })
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { Subject, take, takeUntil } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from '../../../../shared/modal/delete-modal/delete-modal.component';

@Component({
  selector: 'app-project-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './project-setting.component.html',
  styleUrl: './project-setting.component.scss'
})
export class ProjectSettingComponent implements OnDestroy {
  // Injectors
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  projectService = inject(ProjectService);

  // Variables
  destroy$: Subject<any> = new Subject();
  projectForm!: FormGroup;
  currentProject:any;
  isLoading:boolean = false;
  modalRef!: NgbModalRef;

  constructor() {
    this.initForm();
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(this.currentProject){
        this.setFormValues()
      }
    })
  }

  initForm() {
    this.projectForm = this.fb.group({
      projectTitle: ['', Validators.required],
      description: ['', Validators.required],
      public: [false, Validators.required],
      discoverable: ['', Validators.required],
      enforceExpeditionAccess: false,
      principalInvestigator: '',
      principalInvestigatorAffiliation: '',
      projectContact: '',
      projectContactEmail: '',
      publicationGuid: '',
      projectDataGuid: '',
      permitGuid: '',
      license: '',
      recommendedCitation: '',
      localcontextsId: ''
    });
  }

  setFormValues(){
    ['projectTitle', 'description', 'public', 'discoverable', 'enforceExpeditionAccess', 'principalInvestigator', 'principalInvestigatorAffiliation', 'projectContact', 'projectContactEmail', 'publicationGuid', 'projectDataGuid', 'permitGuid', 'license', 'recommendedCitation', 'localcontextsId'].forEach((key:any)=>{
      this.setControlVal(key, this.currentProject[key]);
    })
  }

  update() {
    this.projectForm.markAllAsTouched();
    if (this.projectForm.invalid) return;
    this.isLoading = true;
    const updatedData = { ...this.currentProject, ...this.projectForm.value };
    this.projectService.updateProject(updatedData).pipe(take(1), takeUntil(this.destroy$)).subscribe(
      (res: any) => {
        if (!res) return;
        this.projectService.loadPrivateProjects();
        this.projectService.loadFromSession();
        this.toastr.success('Project Updated');
      }
    )
  }

  deleteProject() {
    this.projectService.deleteProject(this.currentProject)
      .pipe(take(1), takeUntil(this.destroy$)).subscribe((res: any) => {
        this.toastr.success('Project Deleted!');
      })
  }

  openModal(){
    this.modalRef = this.modalService.open(DeleteModalComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false })
    this.modalRef.componentInstance.modalFor = 'Project';
    this.modalRef.dismissed.subscribe((res:any)=>{
      if(res) this.deleteProject();
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  // Helpers functions
  get form() { return this.projectForm.controls; }

  getControlVal(control: string) { return this.form[control].value };

  setControlVal(control: string, val: any) {
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  };

  setReqValidator(control: string, setErr: boolean = true) {
    this.form[control].setValidators(setErr ? [Validators.required] : []);
    this.form[control].updateValueAndValidity();
  }
}

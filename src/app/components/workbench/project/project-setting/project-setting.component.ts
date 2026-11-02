import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { finalize, Subject, take, takeUntil } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from '../../../../dialogs/delete-modal/delete-modal.component';
import { ProjectAccessService, sameUserId } from '../../../../../helpers/services/project-access.service';

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
  accessService = inject(ProjectAccessService);
  private route = inject(ActivatedRoute);
  private loadedKey = '';
  private writeDenied = false;
  isLoading = true;
  isSaving = false;
  canViewProjectSettings = false;
  canEditProjectSettings = false;
  accessError = '';
  saveError = '';

  @ViewChild('expeditionAccessControl') set accessControlAnchor(element: ElementRef<HTMLElement> | undefined) {
    if (element && this.route.snapshot.fragment === 'expedition-access-control') {
      setTimeout(() => element.nativeElement.scrollIntoView({ block: 'center' }));
    }
  }

  // Variables
  destroy$: Subject<any> = new Subject();
  projectForm!: FormGroup;
  currentProject:any;
  modalRef!: NgbModalRef;

  constructor() {
    this.initForm();
    this.projectForm.disable({ emitEvent: false });
    this.accessService.context$.pipe(takeUntil(this.destroy$)).subscribe(access => {
      this.isLoading = access.loading;
      this.accessError = access.error;
      this.canViewProjectSettings = !access.loading && !access.error && access.isMember;
      this.currentProject = access.project;
      if (this.canViewProjectSettings) {
        const key = `${access.user.userId}/${access.project.projectId}`;
        if (key !== this.loadedKey || !this.projectForm.dirty) {
          this.setFormValues();
          this.projectForm.markAsPristine();
          this.saveError = '';
        }
        if (key !== this.loadedKey) this.writeDenied = false;
        this.loadedKey = key;
      }
      this.refreshProjectPermission();
    });
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
    if (this.isSaving) return;
    if (!this.refreshProjectPermission()) {
      this.saveError = 'Only the project owner can change project settings, including expedition access control. Your draft is retained on this page.';
      return;
    }
    this.projectForm.markAllAsTouched();
    if (this.projectForm.invalid) return;
    this.isSaving = true;
    this.saveError = '';
    const updatedData = { ...this.currentProject, ...this.projectForm.getRawValue() };
    this.projectService.updateProject(updatedData).pipe(take(1), takeUntil(this.destroy$), finalize(() => this.isSaving = false)).subscribe({
      next: (res: any) => {
        if (!res) { this.saveError = 'The server did not confirm the update. Your draft is retained on this page.'; return; }
        this.projectForm.markAsPristine();
        this.toastr.success('Project Updated');
        this.projectService.loadAllProjects();
      },
      error: error => {
        if (error.status === 403) {
          this.writeDenied = true;
          this.refreshProjectPermission();
          this.saveError = 'The server denied permission to update this project. Only the project owner can change expedition access control. Your draft is retained on this page.';
        } else this.saveError = 'Unable to update the project. Your draft is retained on this page. Please retry.';
      }
    });
  }

  refreshProjectPermission(): boolean {
    const access = this.accessService.current;
    this.canEditProjectSettings = !this.writeDenied && !access.loading && !access.error && access.isMember && sameUserId(access.user, access.project?.user) &&
      `${access.user?.userId}/${access.project?.projectId}` === this.loadedKey;
    if (this.canEditProjectSettings) this.projectForm.enable({ emitEvent: false });
    else this.projectForm.disable({ emitEvent: false });
    return this.canEditProjectSettings;
  }

  deleteProject() {
    if (!this.refreshProjectPermission()) return;
    this.projectService.deleteProject(this.currentProject)
      .pipe(take(1), takeUntil(this.destroy$)).subscribe((res: any) => {
        this.toastr.success('Project Deleted!');
      })
  }

  openModal(){
    if (!this.refreshProjectPermission()) return;
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

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { NgbDropdown, NgbModal, NgbModalRef, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../helpers/services/project.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { Subject, takeUntil, take, BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../../../helpers/services/data.service';
import { FileService } from '../../../../helpers/services/file.service';
import { UserService } from '../../../../helpers/services/user.service';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [CommonModule, NgbNavModule, ReactiveFormsModule, RouterLink, NgbDropdownModule, FormsModule],
  templateUrl: './project-settings.component.html',
  styleUrl: './project-settings.component.scss'
})
export class ProjectSettingsComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  dataService = inject(DataService);
  fileService = inject(FileService);
  userService = inject(UserService);
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  expeditionService = inject(ExpeditionService);
  
  // Variables
  @ViewChild('userDropdown') userDropdown!:NgbDropdown;
  destroy$:Subject<any> = new Subject();
  currentUser:any;
  currentProject:any;
  projectForm!:FormGroup;
  activeTab:String = 'settings';
  modal:any;
  isLoading:boolean = false;
  modalRef!: NgbModalRef;
  allExpeditions:Array<any> = [];

  // <e,bers
  allMembers:Array<any> = [];
  memberOrderBy:string = 'Username';
  addNewUser:boolean = false;

  userList:Array<any> = []
  showInput:boolean = false;
  selectedUser:any = { username:'' };
  userDetailSub:BehaviorSubject<any> = new BehaviorSubject('');

  constructor(){
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
      this.setFormValues();
      this.getExpeditions();
      this.getMembers();
    });
  }

  initForm(){
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
// formControlName
  setFormValues(){
    ['projectTitle', 'description', 'public', 'discoverable', 'enforceExpeditionAccess', 'principalInvestigator', 'principalInvestigatorAffiliation', 'projectContact', 'projectContactEmail', 'publicationGuid', 'projectDataGuid', 'permitGuid', 'license', 'recommendedCitation', 'localcontextsId'].forEach((key:any)=>{
      this.setControlVal(key, this.currentProject[key]);
    })
  }

  getExpeditions(){
    this.expeditionService.getExpeditionForAdmin(this.currentProject.projectId).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.allExpeditions = res;
    })
  }

  getMembers(){
    this.projectService.allMembers(this.currentProject.projectId).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.allMembers = res;
    })
  }

  // Project FUnctions
  update(){
    this.projectForm.markAllAsTouched();
    if(this.projectForm.invalid) return;
    this.isLoading = true;
    const updatedData = { ...this.currentProject, ...this.projectForm.value };
    this.projectService.updateProject(updatedData).pipe(take(1), takeUntil(this.destroy$)).subscribe(
      (res:any)=>{
        if(!res) return;
        this.projectService.loadPrivateProjects();
        this.projectService.loadFromSession();
        this.toastr.success('Project Updated');
      }
    )
  }

  deleteProject(){
    this.projectService.deleteProject(this.currentProject)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.toastr.success('Project Deleted!');
    })
  }

  // Expedition Functions
  deleteExp(){
    this.expeditionService.deleteExpedition(this.currentProject.projectId, this.modal)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.toastr.success('Expedition deleted!');
    })
  }

  exportExpedtionData(expCode:string){
    this.dataService.exportData(this.currentProject.projectId, expCode).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res.status === 204) this.toastr.warning('No resources found')
      else if(res.url){
        this.fileService.download(res.url);
        this.toastr.success('Downloading Data!');
      }
    })
  }

  // Members Functions
  removeMember(name:string){
    this.projectService.removeMember(this.currentProject.projectId, name).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.getExpeditions();
      this.toastr.success('Member Removed!');
    })
  }

  memberOrderChange(by:string){
    this.memberOrderBy = by;
  }

  get isDropDownOpen(){
    return this.userDropdown?.isOpen();
  }

  // User Functions
  getAllUsers(){
    this.addNewUser = true;
    if(this.userList.length) return;
    this.userService.getUserData().pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=> this.userList = res);
    setTimeout(() => {
      this.userDropdown.autoClose = false;
    }, 2000);
  }

  onUserSelect(user:any){
    this.userDropdown.close();
    this.selectedUser = user;
  }

  openModal(content:TemplateRef<any>, modal:string){
    this.modal = modal;
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false })
  }

  ngOnDestroy(): void {
      this.destroy$.next(null);
      this.destroy$.complete();
  }


  // Helpers functions
  get form(){ return this.projectForm.controls; }

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

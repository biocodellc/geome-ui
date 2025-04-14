import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subject, take, takeUntil } from 'rxjs';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { NetworkService } from '../../../../../helpers/services/network.service';
import { AuthenticationService } from '../../../../../helpers/services/authentication.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder)
  toastr = inject(ToastrService);
  projectService = inject(ProjectService);
  networkService = inject(NetworkService);
  authService = inject(AuthenticationService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$: Subject<any> = new Subject();
  currentUser:any;
  currentProject: any;
  settingForm!: FormGroup;
  isNetworkAdmin:boolean = false;
  currentProjectConfig!: ProjectConfig;

  constructor(){
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((x:any)=>{
      this.currentUser = x;
      if(this.currentUser) this.getNetworkDetails();
    });
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res) this.getProjectConfigs(res.projectConfiguration.id);
    })
  }

  initForm(){
    this.settingForm = this.fb.group({
      networkApproved: [{ value: false, disabled: true }],
      name: ['', Validators.required],
      description: ['', Validators.required],
    })
  }

  getProjectConfigs(id: number) {
    this.projectConfService.getUpdatedCurrentProj().pipe(take(1), takeUntil(this.destroy$)).subscribe(async(res:any) => {
      let project = res ? { ...res } : undefined;
      if(!project){
        try{
          project = await firstValueFrom(this.projectConfService.get(id));
          this.projectConfService.setInitialProjVal(project);
        }
        catch(e){ console.warn('========error=====',e); }
      }
      this.currentProject = project;
      this.currentProjectConfig = project.config;
      this.setFormVal();
    })
  }

  getNetworkDetails(){
    this.networkService.get().pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res && res.user.userId === this.currentUser.userId) this.isNetworkAdmin = true;
      else this.isNetworkAdmin = false;
      const newVal = !this.isNetworkAdmin ? { value: this.getControlVal('networkApproved'), disabled: true } : this.getControlVal('networkApproved');
      this.setControlVal('networkApproved', newVal);
    })
  }

  setFormVal(){
    this.setControlVal('networkApproved', this.currentProject.networkApproved);
    this.setControlVal('name', this.currentProject.name);
    this.setControlVal('description', this.currentProject.description);
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  // Helper Functions
  get form(){ return this.settingForm.controls; }

  getControlVal(control:string){ return this.form[control].value };

  setControlVal(control:string, val:any){
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  }
}

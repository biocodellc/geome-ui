import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../../helpers/services/project.service';
import { debounceTime, Subject, take, takeUntil } from 'rxjs';
import { ProjectConfigurationService } from '../../../helpers/services/project-config.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbDropdownModule],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.scss'
})
export class CreateProjectComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  projectService = inject(ProjectService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  private destroy$ = new Subject<void>();
  projectForm!:FormGroup;
  allProjects:any = [];
  filteredTeams:any = [];
  selectedTeam:any;
  isLoading:boolean = false;

  constructor(){
    this.initForm();
    this.projectConfService.allProjConfigSubject.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res && res?.length > 0) this.allProjects = this.filteredTeams = res.filter((item:any)=> item.networkApproved);
      }
    })
  }

  initForm(){
    this.projectForm = this.fb.group({
      projectTitle: ['', Validators.required],
      description: ['', Validators.required],
      projectConfiguration: ['', Validators.required],
      public: [false]
    })
    this.form['projectConfiguration'].valueChanges.pipe(debounceTime(100), takeUntil(this.destroy$)).subscribe({
      next: (val:any)=>{
        const newVal = val.trim().toLowerCase();
        if(!newVal) this.filteredTeams = this.allProjects;
        else this.filteredTeams = this.allProjects.filter((i:any)=> i.name.toLowerCase().includes(newVal));
      }
    })
  }

  get form(){ return this.projectForm.controls; }

  onTeamSelect(team:any){
    this.selectedTeam = team;
    this.form['projectConfiguration'].setValue(team.name);
    this.form['projectConfiguration'].updateValueAndValidity();
  }
  
  createProject(){
    this.projectForm.markAllAsTouched();
    if(this.projectForm.invalid) return;

    this.isLoading = true;
    const projectData = { ...this.projectForm.value, "projectConfiguration": this.selectedTeam };
    this.projectService.createProject(projectData).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.projectService.loadPrivateProjects();
        this.projectService.setCurrentProject(res);
      },
      error: (err:any)=>{
        this.isLoading = false;
        this.toastr.error(err.error.usrmessage || 'Something Went Wrong!');
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

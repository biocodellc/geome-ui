import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';

@Component({
  selector: 'app-entity-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './entity-details.component.html',
  styleUrl: './entity-details.component.scss'
})
export class EntityDetailsComponent implements OnDestroy{
  // Injectors
  projectService = inject(ProjectService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$:Subject<any> = new Subject();
  currentProject:any;
  currentProjectConfig!:ProjectConfig;
  detailsList:Array<any> = [];

  constructor(){
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(this.currentProject){
        this.getProjectConfigs(this.currentProject.projectConfiguration.id);
      }
    })
  }

  getProjectConfigs(id:number){
    this.projectConfService.get(id).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProjectConfig = res.config;
      console.log(this.currentProjectConfig);
      // this.detailsList = this.currentProjectConfig.entities;
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

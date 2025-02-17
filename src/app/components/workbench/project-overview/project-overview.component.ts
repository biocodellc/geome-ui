import { Component, inject } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [],
  templateUrl: './project-overview.component.html',
  styleUrl: './project-overview.component.scss'
})
export class ProjectOverviewComponent {
  // Injectables
  private router = inject(Router);
  private projectService = inject(ProjectService)

  // Variables
  projectDetails:any;

  constructor(){
    this.projectService.currentProject$.subscribe((res:any)=>{
      if(res) this.projectDetails = res;
    })
  }
}

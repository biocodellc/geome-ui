import { Component, inject } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, NgbPopoverModule],
  templateUrl: './project-overview.component.html',
  styleUrl: './project-overview.component.scss'
})
export class ProjectOverviewComponent {
  // Injectables
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private expeditionService = inject(ExpeditionService);

  // Variables
  projectDetails:any;
  templateUrl:string = '';
  teamUrl:string = '';
  allExpedition:Array<any> = [];
  displayExpedition:Array<any> = [];
  isLoading:boolean = true;

  constructor(){
    const currentUrl = window.location.href;
    this.projectService.currentProject$.subscribe((res:any)=>{
      if(res){
        this.projectDetails = res;
        this.getExpeditionStats();
        this.templateUrl = currentUrl.replace('project-overview', 'template') + `?projectId${res.projectId}`;
        this.teamUrl = currentUrl.replace('project-overview', 'team-overview') + `?projectId${res.projectId}`;
      }
    })
  }

  getExpeditionStats(){
    this.expeditionService.stats(this.projectDetails.projectId).subscribe({
      next: (res:any)=>{
        if(res) this.allExpedition = this.displayExpedition = res;
      },
      complete: ()=> this.isLoading = false
    })
  }
}

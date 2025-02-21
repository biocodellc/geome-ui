import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../helpers/services/project.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { Subject, take, takeUntil } from 'rxjs';
import { TemplateService } from '../../../../helpers/services/template.service';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule, RouterLink],
  templateUrl: './template.component.html',
  styleUrl: './template.component.scss'
})
export class TemplateComponent {
  // Injectors
  projectService = inject(ProjectService);
  templateService = inject(TemplateService);
  authService = inject(AuthenticationService);
  // expeditionService = inject(ExpeditionService);

  // Variables
  private destroy$ = new Subject<void>();
  currentUser: any;
  currentProject: any;
  isLoading: boolean = true;
  worksheets: Array<any> = [];
  allTemplates:Array<any> = [];

  constructor() {
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res: any) => this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        console.log('====current project=====', res);
        this.currentProject = res;
        this.getTemplates();
        this.getWorksheets();
      }
    })
  }

  getWorksheets(){
    this.worksheets = [];
    this.currentProject.config.entities.forEach((e:any) => {
      let name = e.worksheet;
      if (!name || this.worksheets.find(d => d === name)) return;
      this.worksheets.push(name);
    });
    if (this.worksheets.length > 1 && !this.worksheets.includes('Workbook')) {
      this.worksheets.unshift('Workbook');
    }
    console.log('=======worksheets====',this.worksheets)
  }

  getTemplates(){
    this.templateService.getAllTempates(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.allTemplates = res;
        this.isLoading = false;
      },
      error: ()=> this.isLoading = false
    })
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, RouterLink, ],
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss'
})
export class ValidationComponent implements OnDestroy{
  // Injectors
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  expeditionService = inject(ExpeditionService);
  
  // Variables
  private destroy$ = new Subject<void>();
  currentUser:any;
  currentProject:any;
  isLoading:boolean = true;
  allExpeditions:Array<any> = [];

  constructor(){
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        console.log('====current project=====',res);
        this.currentProject = res;
        this.getAvailableDatatypes();
        this.getAllExpeditions();
        this.getWorksheets();
      }
    })
  }

  getAllExpeditions(){
    this.expeditionService.getAllExpeditions(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.allExpeditions = res;
        this.isLoading = false;
      },
      error: (err:any)=> this.isLoading = false
    })
  }

  getAvailableDatatypes(){
    const dataTypes:Array<any> = [
      { name: 'Workbook', isWorksheet: false },
    ];

    this.currentProject.config.entities.forEach((e:any) => {
      let name = e.worksheet;
      let isWorksheet = true;

      if (!name) {
        switch (e.type) {
          case 'Fastq':
          case 'Fasta':
            name = e.type;
            isWorksheet = false;
            break;
          default:
            return; // skip this b/c there is no worksheet?
        }
      }

      if (dataTypes.find(d => d.name === name)) return;

      dataTypes.push({
        name,
        isWorksheet,
        isRequired: (dt:any) => !dt.Workbook && name === 'Events',
        help: name === 'Events' ? 'An Events worksheet is required if you are creating a new expedition.' : undefined,
      });
    });
    console.log('=======available datatypes====',dataTypes)
    return dataTypes;
  }

  getWorksheets(){
    const worksheets:Array<any> = [];
    this.currentProject.config.entities.forEach((e:any) => {
      let name = e.worksheet;
      if (!name || worksheets.find(d => d === name)) return;
      worksheets.push(name);
    });
    if (worksheets.length > 1 && !worksheets.includes('Workbook')) {
      worksheets.unshift('Workbook');
    }
    console.log('=======worksheets====',worksheets)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

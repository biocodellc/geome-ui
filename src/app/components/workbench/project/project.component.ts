import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './project.component.html'
})
export class ProjectComponent implements OnDestroy{
  // Injectors
  projectService = inject(ProjectService);

  // Variables
  destroy$:Subject<any> = new Subject();
  currentProject:any;

  constructor(){
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}

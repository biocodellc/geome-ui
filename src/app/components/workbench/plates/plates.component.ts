import { Component, inject } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { PlatesService } from '../../../../helpers/services/plates.service';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-plates',
  standalone: true,
  imports: [],
  templateUrl: './plates.component.html',
  styleUrl: './plates.component.scss'
})
export class PlatesComponent {
  // Injectors
  projectService = inject(ProjectService);
  plateService = inject(PlatesService);

  // Variables
  destroy$:Subject<any> = new Subject();
  currentProject:any;
  userPlates:Array<any> = [];
  selectedPlate:string = ''

  constructor(){
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
      this.getPlates();
    })
  }

  getPlates(){
    this.plateService.getAll(this.currentProject.projectId).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.userPlates = res;
      },
      error: ()=>{}
    })
  }
}

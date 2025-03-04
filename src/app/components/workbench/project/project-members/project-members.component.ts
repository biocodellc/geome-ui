import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, RouterLink],
  templateUrl: './project-members.component.html',
  styleUrl: './project-members.component.scss'
})
export class ProjectMembersComponent {
  // Injectors
  toastr = inject(ToastrService);
  projectService = inject(ProjectService);

  // Variables
  destroy$:Subject<any> = new Subject();
  memberOrderBy:string = 'Username';
  allMembers:Array<any> = [];
  currentProject:any;

  constructor(){
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(res) this.getMembers();
    })
  }

  getMembers(){
    this.projectService.allMembers(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.allMembers = res;
    })
  }

  removeMember(name:string){
    this.projectService.removeMember(this.currentProject.projectId, name).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.getMembers();
      this.toastr.success('Member Removed!');
    })
  }

  memberOrderChange(by:string){
    this.memberOrderBy = by;
  }
}

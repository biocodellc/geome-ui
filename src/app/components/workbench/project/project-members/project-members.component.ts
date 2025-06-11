import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import { DeleteModalComponent } from '../../../../dialogs/delete-modal/delete-modal.component';
import { DummyDataService } from '../../../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, RouterLink],
  templateUrl: './project-members.component.html',
  styleUrl: './project-members.component.scss'
})
export class ProjectMembersComponent {
  // Injectors
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);
  private projectService = inject(ProjectService);
  private dummyDataService = inject(DummyDataService);

  // Variables
  destroy$:Subject<any> = new Subject();
  memberOrderBy:string = 'Username';
  allMembers:Array<any> = [];
  currentProject:any;

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(res) this.getMembers();
    })
  }

  getMembers(){
    this.projectService.allMembers(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.allMembers = res;
      this.dummyDataService.loadingState.next(false);
    })
  }

  removeMember(name:string){
    const modalRef = this.modalService.open(DeleteModalComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false });
    modalRef.componentInstance.modalFor = 'User';
    modalRef.componentInstance.modalMsg = `Are you sure you want to remove <b>${name}</b> from this project? They will no longer have access.`;
    modalRef.dismissed.subscribe((res: any) => {
      if (res){
        this.dummyDataService.loadingState.next(true);
        this.projectService.removeMember(this.currentProject.projectId, name).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
          this.getMembers();
          this.toastr.success('Member Removed!');
          this.dummyDataService.loadingState.next(false);
        })
      }
    })
  }

  memberOrderChange(by:string){
    this.memberOrderBy = by;
  }
}

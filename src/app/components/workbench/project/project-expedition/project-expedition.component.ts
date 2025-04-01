import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../../helpers/services/expedition.service';
import { ToastrService } from 'ngx-toastr';
import { FileService } from '../../../../../helpers/services/file.service';
import { DataService } from '../../../../../helpers/services/data.service';
import { DeleteModalComponent } from '../../../../dialogs/delete-modal/delete-modal.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-project-expedition',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-expedition.component.html',
  styleUrl: './project-expedition.component.scss'
})
export class ProjectExpeditionComponent {
  // Injectors
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  fileService = inject(FileService);
  dataService = inject(DataService);
  expService = inject(ExpeditionService);
  projectService = inject(ProjectService);

  // Variables
  destroy$:Subject<any> = new Subject();
  currentProject:any;
  allExpeditions:Array<any> = [];
  modalRef!: NgbModalRef;

  constructor(){
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(this.currentProject) this.getExpeditions()
    })
  }

  getExpeditions(){
    this.expService.getExpeditionForAdmin(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.allExpeditions = res;
    })
  }

  deleteExp(data:any){
    this.expService.deleteExpedition(this.currentProject.projectId, data)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.toastr.success('Expedition deleted!');
    })
  }

  exportExpedtionData(expCode:string){
    this.dataService.exportData(this.currentProject.projectId, expCode).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if (res.status === 204) this.toastr.warning('No resources found')
      else if(res.url){
        this.fileService.download(res.url);
        this.toastr.success('Downloading Data!');
      }
    })
  }

  openModal(expData:any) {
    this.modalRef = this.modalService.open(DeleteModalComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false })
    this.modalRef.componentInstance.modalFor = 'Expedition';
    this.modalRef.dismissed.subscribe((res: any) => {
      if (res) this.deleteExp(expData);
    })
  }
}

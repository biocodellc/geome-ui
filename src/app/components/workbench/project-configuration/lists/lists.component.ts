import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbModalModule, ReactiveFormsModule],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent {
  // Injectors
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$: Subject<any> = new Subject();
  currentProject: any;
  currentProjectConfig!: ProjectConfig;
  allLists: Array<any> = [];
  modalRef!: NgbModalRef;
  listForm!:FormGroup;

  constructor() {
    this.initForm();
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) this.getProjectConfigs(res.projectConfiguration.id);
    })
  }

  initForm(){
    this.listForm = this.fb.group({
      alias: ['', Validators.required],
      caseInsensitive: [false],
      fields: [[]],
      networkList: false,
      addedByUser: [true]
    })
  }

  getProjectConfigs(id: number) {
    this.projectConfService.get(id).pipe(take(1), takeUntil(this.destroy$)).subscribe((res: any) => {
      this.currentProject = res;
      this.currentProjectConfig = res.config;
      this.allLists = this.sortList(this.currentProjectConfig.lists);
      console.log(this.allLists);
    })
  }

  sortList(data:Array<any>):Array<any>{
    return data.sort((a:any, b:any)=>{
      a = a.alias.toLowerCase();
      b = b.alias.toLowerCase();
      if(a > b) return 1;
      else if(a < b) return -1;
      else return 0;
    });
  }

  openModal(content:TemplateRef<any>){
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false });
  }

  saveList(){
    const newData = [ ...this.allLists, this.listForm.value ];
    this.allLists = this.sortList(newData);
    this.listForm.reset();
    this.modalRef.close();
  }

  saveConfig(){}

  removeList(list:any){
    const idx = this.allLists.findIndex((item:any)=> item.alias == list.alias && item.addedByUser);
    if(idx == -1) return;
    this.allLists = this.allLists.slice(0, idx).concat(this.allLists.slice(idx + 1));
  }

  get form(){ return this.listForm.controls; }

  get changesDone(){ return this.allLists.find((item:any)=> item && item?.addedByUser) };
}

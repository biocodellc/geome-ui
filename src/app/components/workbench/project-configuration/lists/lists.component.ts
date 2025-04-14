import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subject, take, takeUntil } from 'rxjs';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DummyDataService } from '../../../../../helpers/services/dummy-data.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbModalModule, ReactiveFormsModule],
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.scss'
})
export class ListsComponent {
  // Injectors
  router = inject(Router);
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$: Subject<any> = new Subject();
  currentProject: any;
  currentProjectConfig!: ProjectConfig;
  allLists: Array<any> = [];
  modalRef!: NgbModalRef;
  listForm!:FormGroup;
  userLists:any[] = [];
  networkLists:any[] = [];

  constructor() {
    this.dummyDataService.loadingState.next(true);
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
      networkList: false
    })
  }

  getProjectConfigs(id: number) {
    this.projectConfService.getUpdatedCurrentProj().pipe(take(1), takeUntil(this.destroy$)).subscribe(async(res:any) => {
      if(res) this.processDataFormatting({ ...res });
      else{
        try{
          const response = await firstValueFrom(this.projectConfService.get(id));
          this.projectConfService.setInitialProjVal(cloneDeep(response));
          this.processDataFormatting(response);
        }
        catch(e){ console.warn('======error in API====',e) }
      }
    })

  }

  processDataFormatting(project: any) {
    this.currentProject = project;
    this.currentProjectConfig = project.config;
    this.userLists = this.currentProjectConfig.lists.filter(list => !list.networkList);
    this.networkLists = this.currentProjectConfig.lists.filter(list => list.networkList);
    this.formatListsData();
    this.dummyDataService.loadingState.next(false);
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

  formatListsData() {
    const sortedUserLists = this.sortList(this.userLists);
    const sortedNetworkLists = this.sortList(this.networkLists);
    this.allLists = [...sortedUserLists, ...sortedNetworkLists];
  }

  saveList(){
    const listData = cloneDeep(this.listForm.value);
    this.userLists.push(this.listForm.value);
    this.formatListsData();
    this.setControlVal('alias', '');
    this.modalRef.close();
    this.updateConfigs();
    const payload = JSON.stringify(listData);
    this.router.navigateByUrl(`/workbench/config/lists/${listData.alias}?new_list=${btoa(payload)}`);
  }

  updateConfigs(){
    const projectData = { ...this.currentProject };
    projectData.config.lists = this.allLists;
    this.projectConfService.updateCurrentProj(projectData);
  }

  saveConfig(){
    const projectData = { ...this.currentProject };
    projectData.config.lists = this.allLists;
    this.projectConfService.save(projectData).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.toastr.success('Configs Updated!');
    })
  }

  removeList(list:any){
    const idx = this.allLists.findIndex((item:any)=> item.alias == list.alias && !item.networkList);
    if(idx == -1) return;
    this.allLists = this.allLists.slice(0, idx).concat(this.allLists.slice(idx + 1));
    this.updateConfigs();
  }

  get form(){ return this.listForm.controls; }

  setControlVal(control:string, val:any){
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  }

  get changesDone(){ return this.allLists.find((item:any)=> item && item?.addedByUser) };
}

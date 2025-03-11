import { Component, inject, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { CommonModule } from '@angular/common';
import { NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DummyDataService } from '../../../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-entities',
  standalone: true,
  imports: [CommonModule, NgbPopoverModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './entities.component.html',
  styleUrl: './entities.component.scss'
})
export class EntitiesComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$:Subject<any> = new Subject();
  currentProject:any;
  currentProjectConfig!:ProjectConfig;
  entitiesList:Array<any> = [];
  openedPopup!:NgbPopover;
  entityForm!:FormGroup;

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.initForm();
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(this.currentProject){
        console.log(this.currentProject);
        this.getProjectConfigs(this.currentProject.projectConfiguration.id);
      }
    })
  }

  initForm(){
    this.entityForm = this.fb.group({
      conceptAlias: [{ value:'', disabled: true }, ],
      uniqueKey: [{ value:'', disabled: true }],
      conceptURI: [{ value:'', disabled: true }],
      address: [''],
      parentEntity: [{ value:'', disabled: true }],
      generateID: [false],
      uniqueAcrossProject: [false],
      generateEmptyTissue: [false]
    })
  }

  setFormVals(entity:any){
    ['conceptAlias', 'uniqueKey', 'conceptURI', 'address', 'parentEntity', 'generateID', 'uniqueAcrossProject','generateEmptyTissue'].forEach((key:string)=>{
      this.setControlVal(key, entity[key] || false);
    })
  }

  getProjectConfigs(id:number){
    this.projectConfService.get(id).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProjectConfig = res.config;
      this.entitiesList = this.currentProjectConfig.entities;
      this.dummyDataService.loadingState.next(false);
    })
  }

  openEditPopup(p:NgbPopover, entity:any){
    this.openedPopup?.close();
    if(!p.isOpen()){
      this.setFormVals(entity);
      p.open();
      this.openedPopup = p;
    }
    else p.close()
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  // Helpers functions
  get form() { return this.entityForm.controls; }

  getControlVal(control: string) { return this.form[control].value };

  setControlVal(control: string, val: any) {
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  };
}

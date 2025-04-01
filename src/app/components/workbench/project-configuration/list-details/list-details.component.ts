import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, Subject, take, takeUntil } from 'rxjs';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { ToastrService } from 'ngx-toastr';
import { DummyDataService } from '../../../../../helpers/services/dummy-data.service';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DeleteModalComponent } from '../../../../dialogs/delete-modal/delete-modal.component';

@Component({
  selector: 'app-list-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './list-details.component.html',
  styleUrl: './list-details.component.scss'
})
export class ListDetailsComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder)
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  activatedRoute = inject(ActivatedRoute);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$: Subject<any> = new Subject();
  currentProject: any;
  currentProjectConfig!: ProjectConfig;
  currentList:any;
  allFields: Array<any> = [];
  modalRef!: NgbModalRef;
  fieldForm!: FormGroup;
  isValueExists:boolean = true;

  constructor() {
    this.dummyDataService.loadingState.next(true);
    this.initForm();
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) this.getProjectConfigs(res.projectConfiguration.id);
    })
  }

  initForm() {
    this.fieldForm = this.fb.group({
      value: ['', Validators.required],
      definedBy: [''],
      definition: ['']
    })
    this.form['value'].valueChanges.pipe(takeUntil(this.destroy$), debounceTime(200)).subscribe((val:string) =>{
      const value = val?.trim();
      if(value){
        const similarField = this.allFields.find((field:any)=> field.value === value);
        if(similarField) this.isValueExists = true;
        else this.isValueExists = false;
      }
    })
  }

  getProjectConfigs(id: number) {
    this.projectConfService.get(id).pipe(take(1), takeUntil(this.destroy$)).subscribe((res: any) => {
      this.currentProject = res;
      this.currentProjectConfig = res.config;
      this.getListFromParams(this.currentProjectConfig.lists);
      this.dummyDataService.loadingState.next(false);
    })
  }

  getListFromParams(allList:any[]){
    this.activatedRoute.params.pipe(take(1)).subscribe((parms:any) => {
      if(parms && parms.list){
        this.currentList = allList.find((list:any) => list.alias === parms.list)
        this.allFields = this.currentList.fields;
      }
      console.log('==========all fields========',this.allFields);
    })
  }

  openModal(type:string, selectedField:any ,content?:TemplateRef<any>){
    this.modalRef = this.modalService.open(
      type == 'delete' ? DeleteModalComponent : content,
      { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false }
    );
    if(type === 'delete') this.modalRef.componentInstance.modalFor = 'Field';
    this.modalRef.dismissed.pipe(take(1)).subscribe((res:any) => {
      if(res && type === 'add') this.allFields.push(res);
      else if(type === 'delete'){
        const fieldIdx = this.allFields.findIndex((field:any) => field.value === selectedField.value);
        this.allFields = this.allFields.slice(0, fieldIdx).concat(this.allFields.slice(fieldIdx + 1));
      }
    })
  }

  saveField(){
    this.fieldForm.markAllAsTouched();
    if(this.fieldForm.invalid || this.isValueExists) return;
    this.modalRef.dismiss({ ...this.fieldForm.value });
    this.fieldForm.reset();
  }

  saveConfigs(){
    this.dummyDataService.loadingState.next(true);
    const updatedProject:any = { ...this.currentProject };
    const listIdx = updatedProject.config.lists.findIndex((list:any) => list.alias === this.currentList.alias);
    if(listIdx !== -1) updatedProject.config.lists[listIdx].fields = [ ...this.allFields ];

    this.projectConfService.save(updatedProject).pipe(take(1), takeUntil(this.destroy$)).subscribe(()=>{
      this.toastr.success('Configs Updated!');
      this.dummyDataService.loadingState.next(false);
    })
  }

  // Helpers
  get form(){ return this.fieldForm.controls; }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

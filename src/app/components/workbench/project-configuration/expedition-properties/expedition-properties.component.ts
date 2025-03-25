import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { ToastrService } from 'ngx-toastr';
import { DummyDataService } from '../../../../../helpers/services/dummy-data.service';
import { NgbModal, NgbModalModule, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DeleteModalComponent } from '../../../../shared/modal/delete-modal/delete-modal.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-expedition-properties',
  standalone: true,
  imports: [CommonModule, NgbModalModule, ReactiveFormsModule],
  templateUrl: './expedition-properties.component.html',
  styleUrl: './expedition-properties.component.scss'
})
export class ExpeditionPropertiesComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$: Subject<any> = new Subject();
  currentProject: any;
  metaDataList: Array<any> = [];
  changedItems: Array<any> = [];
  modalRef!:NgbModalRef;
  expForm!:FormGroup;
  expTypes:string[] = [ 'STRING', 'LIST', 'BOOLEAN' ];

  constructor() {
    this.dummyDataService.loadingState.next(true);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) this.getProjectConfigs(res.projectConfiguration.id);
    })
  }

  getProjectConfigs(id: number) {
    this.projectConfService.get(id).pipe(take(1), takeUntil(this.destroy$)).subscribe((res: any) => {
      this.currentProject = res;
      const metData = this.currentProject.config.expeditionMetadataProperties;
      this.metaDataList = metData.map((item:any, i:number) => ({ idx: i, ...item }));
      console.log('=====metaDatalist=====', [ ...this.metaDataList]);
      this.dummyDataService.loadingState.next(false);
    })
  }

  onRequireChange(event: any, item: any) {
    const val = event.target.checked;
    const itemVal = this.metaDataList.find((e: any) => e.idx == item.idx);
    if (!itemVal) return;
    const idx = this.changedItems.findIndex((e: any) => e = item.idx);
    if (idx != -1) {
      this.changedItems = this.changedItems.slice(0, idx).concat(this.changedItems.slice(idx + 1));
    }
    else this.changedItems.push(item.idx);
  }

  saveConfig() {
    const projectData:any = { ...this.currentProject };
    const updatedMetaData = this.metaDataList.map((item:any)=>{
      delete item.idx;
      if(item.isDeleted) return;
      return item;
    }).filter(item => item)
    projectData.config.expeditionMetadataProperties = updatedMetaData;
    this.projectConfService.save(projectData).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.changedItems = [];
      this.toastr.success('Configuration Updated!');
    })
  }

  removeExpProperty(expData:any){
    const idx = this.metaDataList.findIndex((exp:any) => exp.name == expData.name);
    if(idx != -1)
      this.metaDataList[idx].isDeleted = true;//this.metaDataList.slice(0, idx).concat( this.metaDataList.slice(idx + 1) );

    const idx2 = this.changedItems.find((exp:number) => exp == expData.idx);
    if(idx2 != -1) this.changedItems = this.changedItems.slice(0, idx2).concat( this.changedItems.slice(idx2 + 1) );
  }

  // Ṃodal
  openModal(type:string ,selectedExp?:any, content?: TemplateRef<any>) {
    this.modalRef = this.modalService.open(
      type !== 'delete' ? content : DeleteModalComponent,
      { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false }
    );
    if(type === 'delete')this.modalRef.componentInstance.modalFor = 'Expedition Property';
    else if(type === 'edit') this.initDialogForm(selectedExp);
    else this.initDialogForm();
    this.modalRef.dismissed.pipe(take(1), takeUntil(this.destroy$)).subscribe((res: any) => {
      if(type === 'delete'){
        this.removeExpProperty(selectedExp);
      }
      else if(type === 'edit'){
        this.metaDataList[res.idx] = res;        
        const idx2 = this.changedItems.findIndex((exp:number) => exp === res.idx);
        if(idx2 === -1) this.changedItems.push(res.idx);
      }
      else {
        this.changedItems.push(res.idx);
        this.metaDataList.push(res);
      }
    })
  }

  initDialogForm(value?:any){
    this.expForm = this.fb.group({
      idx: [(value?.idx || value?.idx == 0) ? value?.idx : this.metaDataList.length],
      name: [value?.name, Validators.required],
      type: [value?.type || 'STRING', Validators.required],
      required: [ value?.required ],
      values: [ value?.values ],
    });
    this.form['type'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val:string) => {
      if(val === 'STRING') this.setControlVal('values', null);
      else if(val === 'BOOLEAN') ['values', 'required'].forEach((key:string) => this.setControlVal(key, null));
    })
  }

  saveExpData(){
    this.expForm.markAllAsTouched();
    if(this.expForm.invalid) return;
    const data = { ...this.expForm.value };
    if(data.values) data.values = [ data.values ];
    this.modalRef.dismiss(data);
    this.expForm.reset();
  }

  // Helper Functions
  get form(){ return this.expForm.controls; }

  private getControlVal(control:string){
    return this.form[control].value;
  }

  private setControlVal(control:string, val:any){
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

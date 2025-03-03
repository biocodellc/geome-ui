import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { PlatesService } from '../../../../helpers/services/plates.service';
import { BehaviorSubject, debounceTime, Subject, take, takeUntil } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QueryService, QueryBuilder } from '../../../../helpers/services/query.service';
import { DataService } from '../../../../helpers/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { RecordService } from '../../../../helpers/services/record.service';

@Component({
  selector: 'app-plates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './plates.component.html',
  styleUrl: './plates.component.scss'
})
export class PlatesComponent {
  // Injectors
  fb = inject(FormBuilder);
  modalService =  inject(NgbModal);
  dataService = inject(DataService);
  queryService = inject(QueryService);
  plateService = inject(PlatesService);
  recordService = inject(RecordService);
  toastrService = inject(ToastrService);
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);

  // Variables
  @ViewChild('plateDataModal', { static:false }) plateDataModal!:NgbModalRef;
  destroy$:Subject<any> = new Subject();
  inputChangeSubject:BehaviorSubject<any> = new BehaviorSubject(null);
  currentUser:any;
  currentProject:any;
  plateForm!:FormGroup;
  modalRef!:NgbModalRef;
  dataChanged:boolean = false;
  isLoading:boolean = false;
  isProcessing:boolean = false;
  selectedPlate:string = '';
  userPlates:Array<any> = [];
  activeInput:any;

  constructor(){
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res)
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
      this.getAllUserPlates();
    })
    this.inputChangeSubject.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe((res:any)=> this.checkForValue(res));
  }

  initForm(){
    this.plateForm = this.fb.group({
      plate: ['', Validators.required],
      plateName: ['', Validators.required],
      plateData: [this.dataService.getBaseData()]
    })
  }

  getAllUserPlates(){
    this.plateService.getAll(this.currentProject.projectId).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=> this.userPlates = res,
      error: ()=>{}
    })
  }

  getPlateData(plateName:string){
    this.plateService.get(this.currentProject.projectId, plateName).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        const formattedData = Object.keys(res).map(key => ({ key: key, data: res[key] }) );
        this.setControlVal('plateData', [...formattedData]);
        this.openModal(this.plateDataModal, true);
      },
      error: ()=>{}
    })
  }

  openModal(content: any, large:boolean = false){
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, windowClass: large ? 'max-width no-backdrop' : 'no-backdrop', backdrop: false });
    this.modalRef.dismissed.pipe(take(1), takeUntil(this.destroy$)).subscribe(()=>{
      this.setControlVal('plateName', null);
    })
  }

  openPlateDataModal(){
    this.modalRef.close();
    this.setControlVal('plateData', this.dataService.getBaseData());
    this.openModal(this.plateDataModal, true);
  }

  createNew(){
    const data = this.getControlVal('plateData');
    if(!data || !data.length) return;
    const formattedData = data.reduce((acc:any, item:any) =>{
      acc = { ...acc, [item.key] : item.data };
      return acc
    },{});
    this.plateService.create(this.currentProject.projectId, this.getControlVal('plateName'),formattedData)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.toastrService.success('Plate Created!');
        this.modalRef.close();
        this.setControlVal('plateName', null);
        this.getAllUserPlates();
      },
      error: (err:any) => ''
    })
  }

  onPlateChange(event:any){
    const val = event.target.value;
    console.log(val);
    this.getPlateData(val);
  }

  onDialogInputChange(event:any, col:string, index:number){
    const val = event.target.value.trim();
    if(val){
      this.activeInput = { col: col, index: index, isValid: false };
      this.inputChangeSubject.next(val);
      this.dataChanged = true;
    }
    console.log(val,'<=Val=======Col=>',col,'===index=>',index);
  }

  onInputBlurAfterChanges(col:string, index:number, data?:any){
    if(this.activeInput && this.activeInput.col == col && this.activeInput.index == index && !this.activeInput.isValid){
      const bluredInput:any = document.getElementById(`${col}_tissue_data_${index}`) as HTMLInputElement;
      if(bluredInput) bluredInput.value = '';
    }
    else if(this.activeInput && this.activeInput.col == col && this.activeInput.index == index && this.activeInput.isValid){
      const previousData = this.getControlVal('plateData');
      console.log(previousData);
      const idx = previousData.findIndex((item:any) => item.key === col);
      previousData[idx].data[index - 1] = this.activeInput?.data || data;
      this.setControlVal('plateData', [...previousData]);
    }
    this.activeInput = null;
  }

  checkForValue(tissueId:string){
    if(!this.currentProject || !tissueId) return;
    this.isProcessing = true;
    const entity = this.currentProject.config.entities.find(
      (e:any) => e.conceptAlias === 'Tissue',
    );

    const parentEntity = this.currentProject.config.entities.find(
      (e:any) => e.conceptAlias === entity.parentEntity,
    );

    const builder = new QueryBuilder();
    builder.add(
      `_projects_:${this.currentProject.projectId} AND ${
        parentEntity.conceptAlias
      }.${parentEntity.uniqueKey}::"%${tissueId}%"`,
    );

    builder.setSource([parentEntity.uniqueKey, 'expeditionCode'].join());
    this.queryService.queryJson(builder, parentEntity.conceptAlias, 0, 100, false)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        console.log('==res===',res);
        console.log('==for===',this.activeInput);
        const matchingData = res.data.find((item:any)=> item.materialSampleID == tissueId);
        if(matchingData && this.activeInput){
          this.activeInput.isValid = true;
          this.activeInput.data = matchingData;
          this.isProcessing = false;
        }
      },
      error: (err:any)=> ''
    })
  }

  saveTissueData(){
    const data = this.getControlVal('plateData');
    if(!data || !data.length) return;
    const formattedData = data.reduce((acc:any, item:any) =>{
      acc = { ...acc, [item.key] : item.data };
      return acc
    },{});
    this.plateService.save(this.currentProject.projectId, this.getControlVal('plate'),formattedData)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.toastrService.success('Plate updated!');
        this.modalRef.close();
      },
      error: (err:any) => ''
    })
  }

  deleteTissue(col:string, index:number, data:any){
    this.recordService.delete(data.bcid).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        const previousData = this.getControlVal('plateData')
        const idx = previousData.findIndex((item:any) => item.key === col);
        previousData[idx].data[index - 1] = null;
        this.setControlVal('plateData', [...previousData]);
        this.toastrService.success('Tissue Delete!');
      }
    })
  }

  // Helpers functions
  get form(){ return this.plateForm.controls; }

  getControlVal(control:string){ return this.form[control].value };

  setControlVal(control:string, val:any){
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  };

  setReqValidator(control:string, setErr:boolean = true){
    this.form[control].setValidators(setErr ? [Validators.required] : []);
    this.form[control].updateValueAndValidity();
  }
}

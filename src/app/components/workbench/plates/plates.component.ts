import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { ProjectService } from '../../../../helpers/services/project.service';
import { PlatesService } from '../../../../helpers/services/plates.service';
import { debounceTime, Subject, take, takeUntil, distinctUntilChanged, map, switchMap, of, catchError, Observable, OperatorFunction, merge, filter } from 'rxjs';
import { NgbModal, NgbModalRef, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QueryService, QueryBuilder } from '../../../../helpers/services/query.service';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { ToastrService } from 'ngx-toastr';
import { RecordService } from '../../../../helpers/services/record.service';

import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-plates',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbTypeaheadModule, JsonPipe],
  templateUrl: './plates.component.html',
  styleUrl: './plates.component.scss'
})
export class PlatesComponent {
  // Injectors
  router = inject(Router);
  fb = inject(FormBuilder);
  modalService =  inject(NgbModal);
  dataService = inject(DummyDataService);
  queryService = inject(QueryService);
  plateService = inject(PlatesService);
  recordService = inject(RecordService);
  toastrService = inject(ToastrService);
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);

  // Variables
  @ViewChild('plateDataModal', { static:false }) plateDataModal!:NgbModalRef;
  destroy$:Subject<any> = new Subject();
  currentUser:any;
  currentProject:any;
  plateForm!:FormGroup;
  modalRef!:NgbModalRef;
  tissueModalRef!:NgbModalRef;
  isLoading:boolean = false;
  isProcessing:boolean = false;
  selectedPlate:string = '';
  userPlates:Array<any> = [];
  metadataColumns:string[] = [];
  activeInput:any;
  matchingData:any[] = [];
  selectPlateData:any[] = [];
  selectedTissue:any;
  hashedSample:any;
  displayColumn:string = '';


  @ViewChild('instance', { static: true }) instance!: NgbTypeahead;
  @ViewChild('instance2', { static: true }) instance2!: NgbTypeahead;

	focus$ = new Subject<string>();
	click$ = new Subject<string>();
  focus2$ = new Subject<string>();
	click2$ = new Subject<string>();

	searchPlate: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
		const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
		const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance?.isPopupOpen()));
		const inputFocus$ = this.focus$;

		return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
			map((term:string) =>
				(term === '' ? this.userPlates : this.userPlates.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)),
			),
		);
	};

  searchColumn: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
		const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
		const clicksWithClosedPopup$ = this.click2$.pipe(filter(() => !this.instance2?.isPopupOpen()));
		const inputFocus$ = this.focus2$;

		return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
			map((term:string) =>
				(term === '' ? this.metadataColumns : this.metadataColumns.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1)),
			),
		);
	};

  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((term) => {
        if (term.length < 2) return of([]);

        const payload = this.formatPayload(term);
        if (!payload) return of([]);

        return this.queryService.queryJson(payload.builder, payload.entity, 0, 100, false).pipe(
          map((response: any) => {
            this.matchingData = response.data;
            const sampleIDs = this.matchingData.map((item: any) => item.materialSampleID);
            return sampleIDs.filter((v: string) => v.toLowerCase().includes(term.toLowerCase()));
          }),
          catchError(() => of([]))
        );
      })
    );

  constructor(){
    this.dataService.loadingState.next(true);
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res)
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
      this.getAllUserPlates();
      this.hashedSample = this.currentProject.config.entities.some(
        (e:any) => e.conceptAlias === 'Sample' && e.hashed,
      );
      this.getColumnMetaData();
    })
  }

  getColumnMetaData(){
    const tissueEntity = this.currentProject.config.entities.find((e:any) => e.conceptAlias === 'Tissue');
      const sampleEntity = this.currentProject.config.entities.find((e:any) => e.conceptAlias === 'Sample');
      this.metadataColumns = Array.from(
        new Set(
          tissueEntity.attributes
            .map((a:any) => a.column)
            .concat(sampleEntity.attributes.map((a:any) => a.column)),
        ),
      );
      // this.nonBaseTissueAttributes = tissueEntity.attributes.filter(
      //   a =>
      //     !['tissueID', 'tissueWell', 'tissuePlate', 'materialSampleID'].includes(
      //       a.column,
      //     ),
      // );
      this.metadataColumns.sort();
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
      next: (res:any)=>{
        this.userPlates = res?.filter((item:any) => item).sort() || [];
        this.dataService.loadingState.next(false);
      }
    })
  }

  getPlateData(plateName:string){
    this.plateService.get(this.currentProject.projectId, plateName).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.selectPlateData = Object.keys(res).map(key => ({ key: key, data: res[key] }) );
        this.setControlVal('plateData', cloneDeep(this.selectPlateData));
        this.openModal(this.plateDataModal, true);
      },
      error: ()=>{}
    })
  }

  openModal(content: any, large:boolean = false, type?:string){
    if(type == 'new'){
      this.selectPlateData = [];
    }
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, windowClass: large ? 'max-width no-backdrop' : 'no-backdrop', backdrop: false });
    this.modalRef.dismissed.pipe(take(1), takeUntil(this.destroy$)).subscribe(()=>{
      if(this.getControlVal('plateName')) this.setControlVal('plateName', null);
    })
  }

  openPlateDataModal(){
    this.modalRef?.close();
    if(!this.getControlVal('plate')) this.setControlVal('plate', this.getControlVal('plateName'));
    this.setControlVal('plateData', this.selectPlateData.length ? cloneDeep(this.selectPlateData) : this.dataService.getBaseData());
    this.openModal(this.plateDataModal, true);
  }

  createNew(){
    this.dataService.loadingState.next(true);
    const data = this.getControlVal('plateData');
    if(!data || !data.length) return;
    const formattedData = data.reduce((acc:any, item:any) =>{
      acc = { ...acc, [item.key] : item.data };
      return acc
    },{});
    this.plateService.create(this.currentProject.projectId, this.getControlVal('plateName'),formattedData)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        res = res?.plate || res;
        this.selectPlateData = Object.keys(res).map(key => ({ key: key, data: res[key] }) );
        this.setControlVal('plateData', cloneDeep(this.selectPlateData));
        this.getAllUserPlates();
        this.setControlVal('plate', this.getControlVal('plateName'));
        this.setControlVal('plateName', null);
        this.form['plateName'].markAsUntouched();
        this.toastrService.success('Plate Created!');
      },
    })
  }

  onPlateChange(event:any){
    const val = event.item;
    this.getPlateData(val);
  }

  onDialogInputChange(event:any, col:string, index:number){
    const val = event.target.value.trim();
    this.activeInput = { col: col, index: index, isValid: false };
    if(!val){
      this.activeInput = null;
      this.updateData(col, index, null);
    }
  }

  onSampleIdSelect(event:any, col:string, index:number){
    if(this.activeInput && this.activeInput.index == index && this.activeInput.col == col){
      this.activeInput.isValid = true;
      this.activeInput.data = event.item;
      this.onInputBlurAfterChanges(col, index);
    }
  }

  onInputBlurAfterChanges(col:string, index:number){
    if(this.activeInput && this.activeInput.col == col && this.activeInput.index == index && !this.activeInput.isValid){
      const bluredInput:any = document.getElementById(`${col}_tissue_data_${index}`) as HTMLInputElement;
      if(bluredInput) bluredInput.value = '';
    }
    else if(this.activeInput && this.activeInput.col == col && this.activeInput.index == index && this.activeInput.isValid){
      this.updateData(col, index, this.activeInput.data);
    }
    this.activeInput = null;
    this.matchingData = [];
  }

  updateData(col:string, index:number, data:any){
    const previousData = cloneDeep(this.getControlVal('plateData'));
    const idx = previousData.findIndex((item:any) => item.key === col);
    previousData[idx].data[index - 1] = this.matchingData.find((item:any) => item.materialSampleID === data);
    setTimeout(() => {
      this.setControlVal('plateData', [...previousData]);
    }, 500);
  }

  formatPayload(tissueId:string):any {
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
    return { builder,  entity: parentEntity.conceptAlias };
  }

  saveTissueData(){
    this.dataService.loadingState.next(true);
    const data = this.getControlVal('plateData');
    if(!data || !data.length) return;
    const formattedData = data.reduce((acc:any, item:any) =>{
      acc = { ...acc, [item.key] : item.data };
      return acc
    },{});
    this.plateService.save(this.currentProject.projectId, this.getControlVal('plate'),formattedData)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        res = res?.plate || res;
        this.selectPlateData = Object.keys(res).map(key => ({ key: key, data: res[key] }) );
        this.setControlVal('plateData', cloneDeep(this.selectPlateData));
        this.dataService.loadingState.next(false);
        this.toastrService.success('Plate updated!');
      },
      error: (err:any) => ''
    })
  }

  deleteTissue(col:string, index:number, data:any){
    this.recordService.delete(data.bcid).pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        const previousData = cloneDeep(this.getControlVal('plateData'));
        const idx = previousData.findIndex((item:any) => item.key === col);
        previousData[idx].data[index - 1] = null;
        this.setControlVal('plateData', [...previousData]);
        this.toastrService.success('Tissue Delete!');
      }
    })
  }

  openTissueDetails(data:any, content:TemplateRef<any>){
    if(!data?.tissueID) return;
    this.selectedTissue = data;
    this.tissueModalRef = this.modalService.open(content, { animation: true, centered: true, scrollable: true  });
    this.tissueModalRef.result.then(() => this.selectedTissue = null);
    this.tissueModalRef.closed.pipe(take(1)).subscribe(() => this.selectedTissue = null);
    this.tissueModalRef.dismissed.pipe(take(1)).subscribe(() => this.selectedTissue = null);
  }

  naviagetToRecord(item:any){
    if(item.key !== 'bcid') return;
    this.tissueModalRef.close();
    this.modalRef.close();
    this.router.navigateByUrl(`/record/${item.value}`)
  }

  // Helpers functions
  // get isProjectAdmin():boolean{
  //   return this.currentUser?.userId === this.currentProject?.projectConfiguration.user.userId
  // }

  get canEdit(){
    return this.currentProject.currentUserIsMember && !this.hashedSample;
  }

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

  get isDataEmpty(){
    const arr = this.getControlVal('plateData');
    const isArrEmpty = (arr.map((item:any) => item.data ).filter((data:any) => data.filter((a:any) => a).length > 0 )) == 0;
    const matches = JSON.stringify(this.selectPlateData) === JSON.stringify(arr);
    return this.selectPlateData.length == 0 ? isArrEmpty : matches;
  }
}

import { CommonModule, KeyValue } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { NgbAccordionDirective, NgbAccordionModule, NgbDatepickerModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Subject, takeUntil, take, distinctUntilChanged } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../../../helpers/services/data.service';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { RouterLink } from '@angular/router';
import { loadAsync } from 'jszip'
import { ToastrService } from 'ngx-toastr';
import { SraService } from '../../../../helpers/services/sra.service';

@Component({
  selector: 'app-upload-sra',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule, ReactiveFormsModule, NgbDatepickerModule, RouterLink],
  templateUrl: './upload-sra.component.html',
  styleUrl: './upload-sra.component.scss'
})
export class UploadSraComponent implements AfterViewInit, OnDestroy{
  // Injectors
  private fb = inject(FormBuilder);
  private modalService = inject(NgbModal);
  private toastr = inject(ToastrService);
  private sraService = inject(SraService);
  private dataService = inject(DataService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthenticationService);
  private dummyDataService = inject(DummyDataService);
  private expeditionService = inject(ExpeditionService);

  // Variables
  @ViewChild('accordion') accordion!:NgbAccordionDirective;
  @ViewChild('missing_files_modal') missingFileModalRef!:NgbModalRef;
  @ViewChild('upload_warning_modal') uploadModalRef!:NgbModalRef;
  @ViewChild('result_modal') resultModalRef!:NgbModalRef;
  destroy$:Subject<any> = new Subject();
  expeditions:Array<any> = [];
  currentUser:any;
  currentProject:any;
  active:number = 0;
  sraForm!:FormGroup;
  data = this.dummyDataService.getSraUploadFields();
  sampleTypes: any[] = this.dummyDataService.getSraSampleTypes();
  allBioSamples:any[] = [];
  sraMetadata:any[] = [];
  resultData:any = {};
  canResume:boolean = false;
  missingFiles:string[] = [];
  
  // Preserve original property order
  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return 0;
  }

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.initForm();
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(!res) return;
      this.currentProject = res;
      this.getAllExpeditions();
    })
  }

  ngAfterViewInit(): void {
    this.accordion.toggle(String(this.active));
  }

  initForm(){
    this.sraForm = this.fb.group({
      bioProjectForm: this.fb.group({
        expedition: ['', Validators.required],
        createBioProject: [true],
        title: ['', Validators.required],
        discription: ['', Validators.required]
      }),
      subInfoForm: this.fb.group({
        sraUsername: ['', Validators.required],
        sraEmail: ['', Validators.required],
        sraFirstName: ['', Validators.required],
        sraLastName: ['', Validators.required],
        releaseDate: ['', Validators.required],
      }),
      sampleTypeForm: this.fb.group({
        bioSampleType: ['animal', Validators.required]
      }),
      bioSamplesForm: this.fb.group({
        bioSamples: [[]]
      }),
      metaDataForm: this.fb.group({
        metaData: [[]]
      }),
      fileForm: this.fb.group({
        file: ['', Validators.required],
        fileName: ['', Validators.required]
      }),
    });
    this.setSubscriberForChanges();
  }

  setSubscriberForChanges(){
    this.bioProjectForm['createBioProject'].valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$))
    .subscribe((val:boolean)=>{
      if(val){
        this.getBioProjForm().removeControl('projAccession');
        this.getBioProjForm().addControl('title', this.fb.control('', Validators.required));
        this.getBioProjForm().addControl('discription', this.fb.control(this.currentProject.description,Validators.required));
      }
      else{
        this.getBioProjForm().addControl('projAccession', this.fb.control('', Validators.required));
        ['title', 'discription'].forEach((control:any)=> this.getBioProjForm().removeControl(control));
      }
    })
  }

  getAllExpeditions(){
    this.expeditionService.getExpeditionsForUser(this.currentProject.projectId, true)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.getExpeditionStats(res);
        // this.expeditions = res;
      },
      error: (err:any)=> {}
    })
  }

  getExpeditionStats(expeditions:any[]){
    this.expeditionService.stats(this.currentProject.projectId).pipe(take(1), takeUntil(this.destroy$))
    .subscribe({
      next: (res:any) => {
        const expWithFastqMetaData:any[] = res.filter((exp:any)=> exp.fastqMetadataCount > 0).map((exp:any) => exp.expeditionCode);
        this.expeditions = expeditions.filter((exp:any)=> expWithFastqMetaData.includes(exp.expeditionCode));
        this.dummyDataService.loadingState.next(false);
      }
    })
  }

  getSraData(){
    this.dataService.fetchSraData(this.currentProject.projectId, this.getControlVal('bioProjectForm', 'expedition'))
    .pipe(take(1), takeUntil(this.destroy$))
    .subscribe({
      next: (res:any)=>{
        this.allBioSamples = res.bioSamples.map((sample:any) => ({ ...sample, checked: true }));
        this.sraMetadata = res.sraMetadata;;
      }
    })
  }

  onCheckChange(event:any, item:any){
    item.checked = event.target.checked;
  }

  onAllCheckboxChange(event:any){
    const isChecked = event.target.checked;
    this.allBioSamples = this.allBioSamples.map((item:any) =>{
      item.checked = isChecked;
      return item;
    })
  }

  getHeaders(arr:any[]):string[]{
    return arr[0] ? Object.keys(arr[0]).filter((header:string) => header != 'checked') : [];
  }

  onFileSelect(event:any){
    console.log('=====event====',event.target.files);
    const file:File | undefined = event.target.files[0];
    this.setControlVal('','file',file);
    this.setControlVal('','fileName',file?.name || '');
  }

  async upload(){
    this.dummyDataService.loadingState.next(true);

    const resume = !!this.canResume;
    this.canResume = false;

    if (!resume && !(await this.verifyFileNames())) {
      setTimeout(() => this.dummyDataService.loadingState.next(false), 0);
      return;
    }

    const payload = this.constructPayload();
    console.log('====Payload====',payload);
    return;

    this.sraService.upload(payload, this.fileForm['file'].value, false, (progress:any) => {
      console.log('Progress:', progress);
    }).subscribe({
      next: res => {
        console.log('Upload complete:', res);
      },
      error: err => {
        console.error('Upload failed:', err);
      }
    });
  }

  async verifyFileNames(){
    return true
    const fileNamesToVerify = this.metaDataForm['metaData'].value.reduce((names:any[], m:any) => {
      const n = names.concat([m.filename]);
      if (m.filename2) n.push(m.filename2);
      return n;
    }, []);

    const dateBefore = new Date().getTime();
    try {
      const invalidFilenames = await loadAsync(this.fileForm['file'].value).then((zip:any) => {
        const dateAfter = new Date().getTime();
        console.log('loaded in ', dateAfter - dateBefore, ' ms');

        return fileNamesToVerify.filter((name:string) => !(name in zip.files));
      });

      if (invalidFilenames.length === 0) return true;
      this.missingFiles = invalidFilenames;
      this.modalService.open(this.missingFileModalRef, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false });
      return false;
    }
    catch(e){
      this.modalService.open( this.uploadModalRef, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false });
      const modalResuts = await this.uploadModalRef.result;
      if(modalResuts) return true;
      return false
    }
  }

  next(currentTab:number){
    const currentForm = this.sraForm.get(this.data[currentTab].formName) as FormGroup;
    currentForm.markAllAsTouched();
    if(currentForm.invalid) return;
    if(currentTab == 5){
      this.upload();
      return;
    }
    // Update Variables and open next tab
    this.updateTabData(currentTab);
    this.active = currentTab + 1;
    this.accordion.toggle(String(this.active))
  }

  updateTabData(tab:number){
    if(tab == 0){
      this.getSraData();
      ['sraUsername','sraEmail','sraFirstName', 'sraLastName'].forEach(key => this.setControlVal('subInfoForm', key, this.currentUser[key]));
    }
    else if(tab == 3){
      // Saving Bio Samples
      const selectedBioSamples = this.allBioSamples.filter((item:any) => item.checked).map(({ checked, ...data }:any) => data);
      if(selectedBioSamples.length == 0){
        this.toastr.warning('Please select atlease one sample to proceed!');
        return;
      }
      this.setControlVal('bioSamplesForm', 'bioSamples', selectedBioSamples);

      // Updating SRA Data
      const sampleNames = selectedBioSamples.map(b => b.sample_name);
      const filteredSraMetadata = this.sraMetadata.filter(m =>
        sampleNames.includes(m.sample_name),
      );
      this.setControlVal('metaDataForm', 'metaData', filteredSraMetadata);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // Helpers
  get bioProjectForm(){ return this.getBioProjForm().controls; };
  get subInfoForm(){ return this.getSubInfoForm().controls; };
  get sampleTypeForm(){ return this.getSampleTypeForm().controls; };
  get bioSamplesForm(){ return this.getBioSamplesForm().controls; };
  get metaDataForm(){ return this.getMetaDataForm().controls; };
  get fileForm(){ return this.getFileForm().controls; };

  getBioProjForm(){ return this.sraForm.get('bioProjectForm') as FormGroup; };
  getSubInfoForm(){ return this.sraForm.get('subInfoForm') as FormGroup; };
  getSampleTypeForm(){ return this.sraForm.get('sampleTypeForm') as FormGroup; };
  getBioSamplesForm(){ return this.sraForm.get('bioSamplesForm') as FormGroup; };
  getMetaDataForm(){ return this.sraForm.get('metaDataForm') as FormGroup; };
  getFileForm(){ return this.sraForm.get('fileForm') as FormGroup; };

  getFormControls(formName: string) {
    switch (formName) {
      case 'bioProjectForm':
        return this.bioProjectForm;
      case 'subInfoForm':
        return this.subInfoForm;
      case 'sampleTypeForm':
        return this.sampleTypeForm;
      case 'bioSamplesForm':
        return this.bioSamplesForm;
      case 'metaDataForm':
        return this.metaDataForm;
      default:
        return this.fileForm;
    }
  }

  getControlVal(form:string, control:string){ return this.getFormControls(form)[control].value };

  setControlVal(form:string, control:string, val:any){
    this.getFormControls(form)[control].setValue(val);
    this.getFormControls(form)[control].updateValueAndValidity();
  };

  setReqValidator(form:string, control:string, setErr:boolean = true){
    this.getFormControls(form)[control].setValidators(setErr ? [Validators.required] : []);
    this.getFormControls(form)[control].updateValueAndValidity();
  }

  constructPayload(){
    return {
      projectId: this.currentProject.projectId,
      expeditionCode: this.getControlVal('bioProjectForm', 'expedition'),
      bioProjectAccession: this.bioProjectForm['projAccession'] ? this.getControlVal('bioProjectForm', 'projAccession') : '',
      bioProjectTitle: this.bioProjectForm['title'] ? this.getControlVal('bioProjectForm', 'title') : '',
      bioProjectDescription: this.bioProjectForm['discription'] ? this.getControlVal('bioProjectForm', 'discription') : '',
      bioSampleType: this.getControlVal('sampleTypeForm', 'bioSampleType'),
      bioSamples: this.getControlVal('bioSamplesForm', 'bioSamples'),
      releaseDate: this.getControlVal('subInfoForm', 'sraUsername'),
      sraUsername: this.getControlVal('subInfoForm', 'sraUsername'),
      sraEmail: this.getControlVal('subInfoForm', 'sraEmail'),
      sraFirstName: this.getControlVal('subInfoForm', 'sraFirstName'),
      sraLastName: this.getControlVal('subInfoForm', 'sraLastName'),
    };
  }

  // Getters
  get allSamplesChecked():boolean{
    return this.allBioSamples.filter((items:any) => !items.checked).length > 0 ? false : true;
  }

  get currentTab(){ return this.active };
}

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { NgbAccordionDirective, NgbAccordionModule, NgbAccordionToggle } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Subject, takeUntil, take, distinctUntilChanged } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-upload-sra',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule, ReactiveFormsModule],
  templateUrl: './upload-sra.component.html',
  styleUrl: './upload-sra.component.scss'
})
export class UploadSraComponent implements AfterViewInit, OnDestroy{
  // Injectors
  fb = inject(FormBuilder);
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  expeditionService = inject(ExpeditionService);

  // Variables
  @ViewChild('accordion') accordion!:NgbAccordionDirective;
  destroy$:Subject<any> = new Subject();
  expeditions:Array<any> = [];
  currentUser:any;
  currentProject:any;
  active:number = 0;
  sraForm!:FormGroup;
  data = [
    { name: 'Bio Project' },
    { name: 'Submission Info' },
    { name: 'BioSample Type' },
    { name: 'BioSamples' },
    { name: 'SRA Metadata' },
    { name: 'FIle Upload' },
  ];

  constructor(){
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
        // projAccession: [''],
        title: ['', Validators.required],
        discription: ['', Validators.required]
      }),
      subInfoForm: this.fb.group({}),
      sampleTypeForm: this.fb.group({}),
      samplesForm: this.fb.group({}),
      metaDataForm: this.fb.group({}),
      fileForm: this.fb.group({}),
    });
    this.setSubscriberForChanges();
  }

  setSubscriberForChanges(){
    this.bioProjForm['createBioProject'].valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((val:boolean)=>{
      console.log(val,'======val====');
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
      next: (res:any)=> this.expeditions = res,
      error: (err:any)=> {}
    })
  }

  get currentTab(){ return this.active };

  next(currentTab:number){
    if(currentTab == 5) return;
    this.active = currentTab + 1;
    this.accordion.toggle(String(this.active))
  }

  back(currentTab:number){
    if(currentTab == 0) return;
    this.active = currentTab - 1;
    this.accordion.toggle(String(this.active))
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // Helpers
  get bioProjForm(){ return (this.sraForm.get('bioProjectForm') as FormGroup).controls; };
  get subInfoForm(){ return (this.sraForm.get('subInfoForm') as FormGroup).controls; };
  get sampleTypeForm(){ return (this.sraForm.get('sampleTypeForm') as FormGroup).controls; };
  get bioSamplesForm(){ return (this.sraForm.get('samplesForm') as FormGroup).controls; };
  get metaDataForm(){ return (this.sraForm.get('metaDataForm') as FormGroup).controls; };
  get fileForm(){ return (this.sraForm.get('fileForm') as FormGroup).controls; };

  getBioProjForm(){ return this.sraForm.get('bioProjectForm') as FormGroup; };
  getSubInfoForm(){ return this.sraForm.get('subInfoForm') as FormGroup; };
  getSampleTypeForm(){ return this.sraForm.get('sampleTypeForm') as FormGroup; };
  getBioSamplesForm(){ return this.sraForm.get('samplesForm') as FormGroup; };
  getMetaDataForm(){ return this.sraForm.get('metaDataForm') as FormGroup; };
  getFileForm(){ return this.sraForm.get('fileForm') as FormGroup; };

  getFormControls(formName: string) {
    switch (formName) {
      case 'bioProj':
        return this.bioProjForm;
      case 'subInfo':
        return this.subInfoForm;
      case 'sampleType':
        return this.sampleTypeForm;
      case 'bioSamples':
        return this.bioSamplesForm;
      case 'metaData':
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
}

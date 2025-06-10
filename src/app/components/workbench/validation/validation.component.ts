import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { firstValueFrom, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { NgbModal, NgbModalRef, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { UploadComponent } from '../../../shared/upload/upload.component';
import { environment } from '../../../../environments/environment';

// Uploads
import { ExcelParserService } from '../../../../helpers/services/excel-parser.service';
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../../../helpers/services/data.service';
import { FastqFormComponent } from './fastq-form/fastq-form.component';
import { FastaFormComponent } from './fasta-form/fasta-form.component';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { ResultDialogComponent } from '../../../dialogs/result-dialog/result-dialog.component';
import { ReplaceDataDialogComponent } from '../../../dialogs/replace-data-dialog/replace-data-dialog.component';
import { UploadMapDialogComponent } from '../../../dialogs/upload-map-dialog/upload-map-dialog.component';
import { CreateExpeditionComponent } from '../../../dialogs/create-expedition/create-expedition.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ResultValidationsComponent } from '../../../shared/result-validations/result-validations.component';

const MULTI_EXPEDITION = 'MULTI_EXPEDITION';
const EXCEL_MAX_ROWS_TO_PARSE = 10000;

const LAT_URI = 'urn:decimalLatitude';
const LNG_URI = 'urn:decimalLongitude';

const defaultResults = {
  validation: {},
  status: '',
  uploadMessage: '',
  successMessage: '',
  showCancelButton: false,
  showOkButton: false,
  showContinueButton: false,
  showStatus: false,
  showValidationMessages: false,
  showUploadMessages: false,
  showSuccessMessages: false,
};

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbNavModule, UploadComponent, ReactiveFormsModule, FormsModule, FastqFormComponent, FastaFormComponent, NgbTooltipModule, ResultValidationsComponent],
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss'
})
export class ValidationComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  cdr = inject(ChangeDetectorRef);
  modalService = inject(NgbModal);
  dataService = inject(DataService);
  projectService = inject(ProjectService);
  excelService = inject(ExcelParserService);
  dummyDataService = inject(DummyDataService);
  authService = inject(AuthenticationService);
  expeditionService = inject(ExpeditionService);

  // Variables
  @ViewChild('naanDialog') naanDialog!:NgbModalRef;
  private destroy$ = new Subject<void>();
  currentUser:any;
  currentProject:any;
  modalRef!:NgbModalRef | null;
  validateOnly:boolean = false;
  activeTab:string = 'load';
  fastqMetadataForm!:FormGroup;
  allDataTypes:Array<any> = [];
  worksheetData:Array<any> = [{ worksheet:'Workbook', file: undefined, reload: false }];
  fastaData:FormGroup = this.fb.group({ fastaArr: this.fb.array([]) });
  allExpeditions:Array<any> = [];
  userExpeditions:Array<any> = [];
  checkedTypes:Array<any> = ['Workbook'];
  
  // Another Variables
  verifiedCoordinateWorksheets:any[] = [];

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentUser = res;
      this.validateOnly = !this.currentUser;
    });
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        this.currentProject = res;
        this.allDataTypes = this.getAvailableDatatypes();
        if(this.allDataTypes.find((type:any) => type.name === 'Fastq')) this.initFastqForm();
        this.getAllExpeditions();
      }
    })
  }

  initFastqForm(){
    this.fastqMetadataForm = this.fb.group({
      file: ['', Validators.required],
      libraryLayout: ['', Validators.required],
      libraryStrategy: ['', Validators.required],
      librarySource: ['', Validators.required],
      librarySelection: ['', Validators.required],
      platform: ['', Validators.required],
      designDescription: ['', Validators.required],
      instrumentModel: ['', Validators.required]
    })
  }

  getAllExpeditions(){
    this.expeditionService.getAllExpeditions(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.allExpeditions = res;
        this.dummyDataService.loadingState.next(false);
      }
    })
  }

  navChange(event:any){
    if(this.results && event.nextId === "load") this.results = undefined;
  }

  getAvailableDatatypes(){
    const dataTypes:Array<any> = [
      { name: 'Workbook', isWorksheet: false },
    ];

    this.currentProject.config.entities.forEach((e:any) => {
      let name = e.worksheet;
      let isWorksheet = true;

      if (!name) {
        switch (e.type) {
          case 'Fastq':
          case 'Fasta':
            name = e.type;
            isWorksheet = false;
            break;
          default:
            return; // skip this b/c there is no worksheet?
        }
      }

      if (dataTypes.find(d => d.name === name)) return;

      dataTypes.push({
        name,
        isWorksheet,
        isRequired: (dt:any) => !dt.Workbook && name === 'Events',
        help: name === 'Events' ? 'An Events worksheet is required if you are creating a new expedition.' : undefined,
      });
    });
    return dataTypes;
  }

  get selectedTypes(){ return this.checkedTypes; }

  validateChange(event:any){
    const isChecked = event.target.checked;
    if(isChecked) this.worksheetData.forEach(item => item.reload = false);
  }

  onCheckboxChange(event:any, type:string){
    const worksheets = ["Samples", "Events", "Tissues", "sample_photos", "event_photos"];
    const isChecked = event.target.checked;
    if(!isChecked){
      const index = this.checkedTypes.findIndex(item => item == type);
      this.checkedTypes = this.checkedTypes.slice(0, index).concat(this.checkedTypes.slice(index + 1));
      this.removeWorkSheetData(type);
    }
    else if(type == 'Workbook'){
      this.checkedTypes = this.checkedTypes.filter((data:any)=> !worksheets.includes(data));
      this.checkedTypes.push(type);
      worksheets.forEach(worksheet => this.removeWorkSheetData(worksheet));
      this.worksheetData.push({ worksheet:'Workbook', file: undefined, reload: false });
    }
    else if(type != 'Workbook' && !type.includes('Fas')){
      this.checkedTypes = this.checkedTypes.filter((data:any)=> data != 'Workbook');
      this.checkedTypes.push(type);
      this.removeWorkSheetData('Workbook');
      this.worksheetData.push({ worksheet:type, file: undefined, reload: false });
    }
    else this.checkedTypes.push(type);
  }

  removeWorkSheetData(worksheet:string){
    const idx = this.worksheetData.findIndex(item => item.worksheet == worksheet);
      if(idx === -1) return;
      this.worksheetData = this.worksheetData.slice(0, idx).concat(this.worksheetData.slice(idx + 1));
  }

  onExpeditionChange(event:any){
    const val = event.target.value;
    this.expeditionCode = val;
  }

  async dataFormattingAndErrorCheck() {
    // Show validation errors
    if(!this.checkedTypes.length) return;

    const reqType = this.checkedTypes.filter(type => type !== 'Fastq' && type !== 'Fasta' );
    for(let type of reqType){
      const data = this.worksheetData.find(data => data.worksheet == type);
      if(!data?.file){
        this.toastr.error(`Upload file for ${data.worksheet}`);
        return;
      }
    }

    const unVerifiedCoords = this.verifiedCoordinateWorksheets.filter(item => !item.isVerified);
    if(unVerifiedCoords && unVerifiedCoords.length){
      this.toastr.warning('All coordinates must be verified!');
      return;
    }

    if(this.checkedTypes.includes("Fastq")){
      this.fastqMetadataForm.markAllAsTouched();
      if(this.fastqMetadataForm.invalid) return
    }
    if(this.checkedTypes.includes("Fasta")){
      this.fastaData.markAllAsTouched();
      if(this.fastaData.invalid) return;
    }

    if(!this.expeditionCode){
      this.toastr.warning('Please select expedition!');
      return;
    }
    
    this.uploading = true;
    const data = this.getUploadData();
    const hasReload =
      !this.validateOnly &&
      (data.reloadWorkbooks || data.dataSourceMetadata.some((d:any) => d.reload));

    if (hasReload) {
      console.log('=====goes in if=====');
      const reloadSheets:any[] = [];

      if (data.reloadWorkbooks) {
        const worksheets = this.currentProject.config.entities
          .filter((e:any) => e.worksheet)
          .map((e:any) => e.worksheet);
        const workbook = await firstValueFrom(this.excelService.workbookToJson(data.workbooks[0]));
        Object.keys(workbook)
          .filter(k => worksheets.includes(k))
          .forEach(s => reloadSheets.push(s));
      }

      data.dataSourceMetadata.forEach(
        (wd:any) => wd.reload && reloadSheets.push(wd.metadata.sheetName),
      );

      const confirm:NgbModalRef = this.modalService.open(ReplaceDataDialogComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false })
      confirm.componentInstance.reloadSheets = reloadSheets;

      confirm.result.then((res:any) => {
        if(res) this.handleUpload(data);
      })
    } else {
      this.handleUpload(data);
    }
  }

  handleUpload(uploadData:any) {
    const { projectId } = this.currentProject;

    return this.validateSubmit(
      Object.assign({}, uploadData, { projectId }),
    ).then((data:any) => {
      if (!data) return false;

      if (data.hasError || data.exception) {
        this.results.showValidationMessages = true;
      }

      if (!uploadData.upload) {
        if (data.isValid) {
          this.results.showSuccessMessages = true;
          this.results.successMessage = 'Successfully Validated!';
        }
        this.results.validation = data;
        this.modalRef?.close();
        this.activeTab = 'results';
        return false;
      }

      if (data.isValid) {
        this.continueUpload(data.id);
      } else if (data.hasError) {
        this.results.validation = data;
        this.results.showOkButton = true;
        return false;
      }

      Object.assign(this.results, {
        validation: data,
        showValidationMessages: true,
        showStatus: false,
        showContinueButton: true,
        uploadId: data.id,
        showCancelButton: true,
      });

      return this.modalRef?.result.then(success => {
        if (success) {
          this.continueUpload(data.id);
          this.latestExpeditionCode = uploadData.expeditionCode;
          this.showGenbankDownload = !!uploadData.dataSourceMetadata.find(
            (m:any) => m.dataType === 'FASTQ',
          );
        }
        return success;
      });
    });
  }

  openResultsModal(){
    this.modalRef = this.modalService.open(ResultDialogComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false })
    this.modalRef.componentInstance.results = this.results;
    this.modalRef.result.then((res:any) =>{
      if(res == 'continue'){
        this.continuePromise = this.continueUpload(this.results.uploadId);
        this.results.showContinueButton = false;
        this.results.showCancelButton = false;
        this.results.showValidationMessages = false;
      }
    })
  }

  openCreateExpModal(){
    this.modalRef?.close();
    this.modalRef = this.modalService.open( CreateExpeditionComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false })
    this.modalRef.componentInstance.currentProject = { ...this.currentProject };
    this.modalRef.result.then((res:any) =>{
      if(res) this.getAllExpeditions();
    })
  }

  async validateSubmit(data: any): Promise<any> {
    console.log(data);
    // Clear the results
    this.results = Object.assign({}, defaultResults, {
      showStatus: true,
      status: 'Uploading...',
    });
    this.openResultsModal();   //OpenResult Dialog

    // -------------------------------------------------------------
    try{
      const validateRes:any = await firstValueFrom(this.dataService.validate(data));
      return new Promise(resolve => {
        this.dataService.validationStatus(validateRes.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: (event: any) => {
            if (event.result) {
              this.results.status = '';
              console.log('Validation completed:', event.result);
              resolve(event.result);
            } else {
              this.results.status = `Uploading...<br/>${event.status}`;
              this.results.validation.exception = null;
              console.log('Validation status:', event.status);
            }
          }
        })
      })
    }
    catch(err:any){
      this.results.validation.isValid = false;
      this.results.validation.exception = err.data.usrMessage || 'Server Error!';
      this.results.showOkButton = true;
      this.modalRef?.close();
      return Promise.resolve('');
    }
  }

  continueUpload(uploadId:number) {
    this.results.showStatus = true;
    this.dataService.upload(uploadId)
      .subscribe({
        next: (data:any) => {
          this.results.successMessage = data.message;
          this.modalRef?.close(true);
          this.activeTab = 'results';
        },
        error: (err:any)=>{
          console.log('failed ->', err);
          this.modalRef?.close(false);
          this.results.validation.isValid = false;
          this.results.validation.exception =
          err.error?.message ||
          err.error?.error ||
          err.error?.usrMessage ||'Server Error!';
        }
      })
  }

  isMultiExpeditionUpload() {
    return this.expeditionCode === MULTI_EXPEDITION;
  }

  canReload(worksheet:string) {
    return (
      !this.validateOnly &&
      (!this.isMultiExpeditionUpload() ||
        this.currentProject.config.entities.some(
          (e:any) => e.worksheet === worksheet && e.type === 'Photo',
        ))
    );
  }

  // Uploading Functionws and variables
  results:any = defaultResults;
  naan = environment.naan;
  nValFromFile:number = 0;
  parsing:boolean = false;
  coordinateWorksheets:Array<any>= []
  expeditionCodes:Set<any> = new Set();
  expeditionCode:any;
  multiExpeditionAllowed:boolean = false;
  showExpeditions:boolean = false;
  uploading:boolean = false;
  latestExpeditionCode:string = ''
  showGenbankDownload:boolean = false;
  continuePromise:any;

  getUploadData() {
    const data:any = {
      upload: !this.validateOnly,
      reloadWorkbooks: false,
      dataSourceMetadata: [],
      dataSourceFiles: [],
    };

    if (!this.isMultiExpeditionUpload()) {
      data.expeditionCode = this.expeditionCode;
    }

    this.worksheetData.forEach((wd:any) => {
      if (wd.worksheet === 'Workbook') {
        data.workbooks = [wd.file];
        data.reloadWorkbooks = !this.isMultiExpeditionUpload() && wd.reload;
      } else {
        data.dataSourceMetadata.push({
          dataType: 'TABULAR',
          filename: wd.file.name,
          reload: this.canReload(wd.worksheet) && wd.reload,
          metadata: {
            sheetName: wd.worksheet,
          },
        });
        data.dataSourceFiles.push(wd.file);
      }
    });
    if (this.checkedTypes.includes('Fasta')) {
      const fastaArr = this.fastaData.get('fastaArr') as FormArray;
      fastaArr.value.forEach((fd:any) => {
        data.dataSourceMetadata.push({
          dataType: 'FASTA',
          filename: fd.file.name,
          reload: false,
          metadata: {
            conceptAlias: this.currentProject.config.entities.find(
              (e:any) => e.type === 'Fasta',
            ).conceptAlias,
            marker: fd.marker,
          },
        });
        data.dataSourceFiles.push(fd.file);
      });
    }
    if (this.checkedTypes.includes('Fastq')) {
      data.dataSourceMetadata.push({
        dataType: 'FASTQ',
        filename: this.fastqMetadataForm.controls['file'].value.name,
        reload: false,
        metadata: {
          conceptAlias: this.currentProject.config.entities.find(
            (e:any) => e.type === 'Fastq',
          ).conceptAlias,
          libraryLayout: this.fastqMetadataForm.controls['libraryLayout'].value,
          libraryStrategy: this.fastqMetadataForm.controls['libraryStrategy'].value,
          librarySource: this.fastqMetadataForm.controls['librarySource'].value,
          librarySelection: this.fastqMetadataForm.controls['librarySelection'].value,
          platform: this.fastqMetadataForm.controls['platform'].value,
          designDescription: this.fastqMetadataForm.controls['designDescription'].value,
          instrumentModel: this.fastqMetadataForm.controls['instrumentModel'].value,
        },
      });
      data.dataSourceFiles.push(this.fastqMetadataForm.controls['file'].value);
    }

    return data;
  }

  replaceCheckChange(event:any){
    const {worksheet, reload} = event;
    let data = this.worksheetData.find(d => d.worksheet === worksheet);
    if(data) data.reload = reload;
  }

  handleWorksheetDataChange(event:any) {
    const {worksheet, file, reload} = event;
    let data = this.worksheetData.find(d => d.worksheet === worksheet);

    const fileChanged = (!data && file) || data.file !== file;
    if (data) {
      data.file = file;
      data.reload = reload;
    } else {
      data = { worksheet, file, reload };
      this.worksheetData.push(data);
    }

    if (fileChanged && file) {
      this.parsing = true;
      if (worksheet === 'Workbook') {
        this.parseSpreadsheet(new RegExp(`~naan=[0-9]+~`), 'Instructions', file).subscribe((n:any) => {
          if (this.naan && n && n > 0 && Number(n) !== Number(this.naan)) {
            this.nValFromFile = n;

            this.modalRef = this.modalService.open(this.naanDialog, { animation: true, centered: true });
            this.modalRef.result.then((res:any) => {
              if(res) this.handleNewWorksheet(data)
                else{
                  this.modalRef = null;
                  this.nValFromFile = 0;
                }
            },
            (err:any) =>{
              this.nValFromFile = 0;
              this.modalRef = null;
            }
          )
          } else {
            console.log('Going in else condition')
            this.handleNewWorksheet(data);
          }
        });
      } else {
        this.handleNewWorksheet(data);
      }
    } else if (!file) {
      const i = this.coordinateWorksheets.findIndex(v => v === worksheet);
      if (i > -1) {
        this.coordinateWorksheets.splice(i, 1);
      }
    }
  }

  async handleNewWorksheet(data:any) {
    const { worksheet, file } = data;
    const expeditionCodes = new Set<string>();
    let timedOut = false;
  
    const updateView = (parsedEntireBook = false) => {
      this.parsing = false;
      if (timedOut && this.expeditionCode) return;
  
      if (expeditionCodes.size === 1) {
        const expeditionCode = Array.from(expeditionCodes)[0];
        if (this.userExpeditions.some(e => e.expeditionCode === expeditionCode)) {
          this.expeditionCode = expeditionCode;
        }
      } else if (expeditionCodes.size > 1 && this.multiExpeditionAllowed) {
        this.expeditionCode = MULTI_EXPEDITION;
      } else if (parsedEntireBook) {
        this.multiExpeditionAllowed = false;
      }
  
      this.showExpeditions = true;
      this.cdr.detectChanges(); // Manually trigger change detection
    };
  
    const showError = (message: string) => {
      this.toastr.error(message);
    };
  
    if (worksheet === 'Workbook') {
      const parseWorkbook = async ():Promise<boolean> => {
        const response = await firstValueFrom(this.excelService.parseWorkbookWithHeaders(file));
        const wb:any = response;
        let rowCount = 0;
        let hasCoordinateWorksheet = false;
        const worksheets: string[] = [];
  
        for (const sheetName of wb.SheetNames) {
          if (this.setCoordinateWorksheet(sheetName)) {
            hasCoordinateWorksheet = true;
          }
          if (this.currentProject.config.worksheets().includes(sheetName)) {
            worksheets.push(sheetName);
          }
          rowCount += wb.Sheets[sheetName]?.rowCount || 0;
        }
  
        let fullWorkbookPromise: Observable<any> | undefined;
        if (hasCoordinateWorksheet && rowCount <= EXCEL_MAX_ROWS_TO_PARSE) {
          fullWorkbookPromise = this.excelService.workbookToJson(file);
          fullWorkbookPromise.subscribe((fullWorkbook:any) => {
            if (!timedOut && (!this.uploading || this.allDataTypes.every(d => d.file))) {
              this.verifyCoordinates(worksheet, fullWorkbook);
              this.coordinateWorksheets.push('Workbook');
            }
          });
        }
  
        let parsedEntireBook = true;
        if (worksheets.length > 0) {
          const hasExpeditionCodeSheet = worksheets.some(sheet => wb.Sheets[sheet]?.headers.includes('expeditionCode'));
  
          if (hasExpeditionCodeSheet) {
            parsedEntireBook = rowCount <= EXCEL_MAX_ROWS_TO_PARSE;
            const opts = parsedEntireBook ? {} : { sheetRows: Math.floor(EXCEL_MAX_ROWS_TO_PARSE / worksheets.length) };
            fullWorkbookPromise = fullWorkbookPromise || this.excelService.workbookToJson(file, opts);
  
            const fullWorkbook:any = await fullWorkbookPromise;
            if (!timedOut && (!this.uploading || this.allDataTypes.every(d => d.file))) {
              for (const sheet of worksheets) {
                const records = fullWorkbook[sheet] || [];
                records.forEach((record:any) => record.expeditionCode && expeditionCodes.add(record.expeditionCode));
              }
            }
          }
        } else {
          showError(`Failed to find one of the following worksheets: ${this.currentProject.config.worksheets().join(', ')}`);
        }
  
        return Promise.resolve(parsedEntireBook);
      };
  
      const timeout = setTimeout(() => {
        timedOut = true;
        showError('Timed out attempting to parse Workbook for coordinate verification.');
        updateView();
      }, 2000);
  
      parseWorkbook().then((parsedEntireBook:any) => {
        if (!timedOut) clearTimeout(timeout);
        updateView(parsedEntireBook);
      });
    } else {
      this.excelService.workbookToJson(file).subscribe((res:any)=>{
        const workbook = res;
        if (this.setCoordinateWorksheet(worksheet)) {
          this.verifyCoordinates(worksheet, workbook);
          this.coordinateWorksheets.push(worksheet);
        }
    
        (workbook.default || []).forEach((record:any) => record.expeditionCode && expeditionCodes.add(record.expeditionCode));
        updateView();
      })
    }
  }

  parseSpreadsheet(regExpression:RegExp, sheetName:string, file:File):Observable<any>{
    if (this.excelService.isExcelFile(file)) {
      return this.excelService.findExcelCell(file, regExpression, sheetName).pipe( map(match =>
        match
          ? match
              .toString()
              .split('=')[1]
              .slice(0, -1)
          : match,
      ));
    }
    return new Observable();
  };

  setCoordinateWorksheet(worksheet:string) {
    return this.currentProject.config.entities
      .filter((e:any) => e.attributes.some((a:any) => a.uri === LAT_URI))
      .some((e:any) => e.worksheet === worksheet);
  }

  async verifyCoordinates(worksheet:string, workbook:any) {
    const { config } = this.currentProject;
    const eventEntity = config.entities.find((e:any) => e.conceptAlias === 'Event');
    const { worksheet: eventWorksheet } = eventEntity;

    const latColumn = (
      eventEntity.attributes.find((a:any) => a.uri === LAT_URI) || {}
    ).column;
    const lngColumn = (
      eventEntity.attributes.find((a:any) => a.uri === LNG_URI) || {}
    ).column;

    if (!workbook) {
      const data = this.allDataTypes.find((d:any) => d.name === worksheet);
      workbook = await firstValueFrom(this.excelService.workbookToJson(data.file));
    }

    try {
      const worksheetInfo:any = { worksheet, scope: undefined, isVerified: false };
      const d = workbook.isExcel ? workbook[eventWorksheet] : workbook.default;
      if (!d.some((e:any) => e[latColumn] && e[lngColumn])) {
        this.toastr.error(`We didn't find any coordinates for your ${eventWorksheet} records`);
        worksheetInfo.isVerified = true;
        this.verifiedCoordinateWorksheets.push(worksheetInfo);
        return;
      }

      const uniqueKey = eventEntity.hashed
        ? config.entities.find(
            (e:any) =>
              e.worksheet === eventWorksheet &&
              e.parentEntity === eventEntity.conceptAlias,
          ).uniqueKey
        : eventEntity.uniqueKey;

      const scope = Object.assign({}, {
        d,
        latColumn,
        lngColumn,
        uniqueKey,
      });

      worksheetInfo.scope = scope;
      this.verifiedCoordinateWorksheets.push(worksheetInfo);
      this.openMapDialog(worksheetInfo);
    } catch (e) {
      this.toastr.error('Failed to load samples map');
      const i = this.verifiedCoordinateWorksheets.findIndex(v => v.worksheet === worksheet);
      if (i > -1) this.verifiedCoordinateWorksheets.splice(i, 1);
    }
  }

  openMapDialog(data:any){
    this.modalRef = null;
      this.modalRef = this.modalService.open(UploadMapDialogComponent, { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false });
      this.modalRef.componentInstance.scope = data.scope;

      this.modalRef.result.then(
        (res:any)=>{
          if(res){
            const i = this.verifiedCoordinateWorksheets.findIndex(v => v.worksheet === data.worksheet);
            if(i > -1) this.verifiedCoordinateWorksheets[i].isVerified = true;
          }
        }
      )
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

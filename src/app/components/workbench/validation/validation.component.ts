import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { UploadComponent } from '../../../shared/upload/upload.component';
import { environment } from '../../../../environments/environment';

// Uploads
import { ExcelParserService } from '../../../../helpers/services/excel-parser.service';

const MULTI_EXPEDITION = 'MULTI_EXPEDITION';
const EXCEL_MAX_ROWS_TO_PARSE = 10000;

const LAT_URI = 'urn:decimalLatitude';
const LNG_URI = 'urn:decimalLongitude';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbNavModule, UploadComponent],
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss'
})
export class ValidationComponent implements OnDestroy{
  // Injectors
  cdr = inject(ChangeDetectorRef);
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  expeditionService = inject(ExpeditionService);
  excelService = inject(ExcelParserService);
  
  // Variables
  private destroy$ = new Subject<void>();
  currentUser:any;
  currentProject:any;
  isLoading:boolean = true;
  activeTab:string = 'load';
  allDataTypes:Array<any> = [];
  allExpeditions:Array<any> = [];
  userExpeditions:Array<any> = [];
  checkedTypes:Array<any> = ['Workbook'];

  // Fastq Variables
  fastq:any = {
    libraryStrategies : [],
    librarySources : [],
    librarySelections : [],
    platforms : [],
    models : []
  };

  constructor(){
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res:any)=> this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        console.log('====current project=====',res);
        this.currentProject = res;
        this.allDataTypes = this.getAvailableDatatypes();
        this.getAllExpeditions();
      }
    })
  }

  getAllExpeditions(){
    this.expeditionService.getAllExpeditions(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res) this.allExpeditions = res;
        this.isLoading = false;
      },
      error: (err:any)=> this.isLoading = false
    })
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
    this.checkFastq(dataTypes)
    return dataTypes;
  }

  checkFastq(data:Array<any>){
    const isFastqPresent = data.find((item:any)=> item.name == 'Fastq');
    if(!isFastqPresent) return
    this.fastq.libraryStrategies = this.currentProject.config.getList('libraryStrategy').fields;
    this.fastq.librarySources = this.currentProject.config.getList('librarySource').fields;
    this.fastq.librarySelections = this.currentProject.config.getList('librarySelection').fields;
    this.fastq.platforms = this.currentProject.config.getList('platform').fields
      .reduce((val:any, f:any) => {
        const newObj:any = {};
        newObj['name'] = f.value;
        newObj['data'] = this.currentProject.config.getList(f.value).fields.map((field:any) => field.value);
        val.push(newObj)
        return val;
      }, []);
  }

  get selectedTypes(){ return this.checkedTypes; }

  onCheckboxChange(event:any, type:string){
    const worksheets = ["Samples", "Events", "Tissues", "sample_photos", "event_photos"];
    const isChecked = event.target.checked;
    if(!isChecked){
      const index = this.checkedTypes.findIndex(item => item == type);
      this.checkedTypes = this.checkedTypes.slice(0, index).concat(this.checkedTypes.slice(index + 1));
    }
    else if(type == 'Workbook'){
      this.checkedTypes = this.checkedTypes.filter((data:any)=> !worksheets.includes(data));
      this.checkedTypes.push(type);
    }
    else if(type != 'Workbook' && !type.includes('Fas')){
      this.checkedTypes = this.checkedTypes.filter((data:any)=> data != 'Workbook');
      this.checkedTypes.push(type);
    }
    else this.checkedTypes.push(type);
  }

  onPlatformsChange(event:any){
    const val = event.target.value;
    const platformData = this.fastq.platforms.find((item:any)=> item.name == val);
    if(platformData) this.fastq.models = platformData.data
  }

  onExpeditionChange(event:any){
    const val = event.target.value;
  }

  // Uploading Functionws and variables
  naan = environment.naan;
  parsing:boolean = false;
  coordinateWorksheets:Array<any>= []
  expeditionCodes:Set<any> = new Set();
  expeditionCode:any;
  multiExpeditionAllowed:boolean = false;
  showExpeditions:boolean = false;
  uploading:boolean = false;

  handleWorksheetDataChange(worksheet:string, file:File, reload:boolean) {
    let data = this.allDataTypes.find(d => d.worksheet === worksheet);

    const fileChanged = (!data && file) || data.file !== file;
    if (data) {
      data.file = file;
      data.reload = reload;
    } else {
      data = { worksheet, file, reload };
      this.allDataTypes.push(data);
    }

    if (fileChanged && file) {
      this.parsing = true;
      if (worksheet === 'Workbook') {
        this.parseSpreadsheet('~naan=[0-9]+~', 'Instructions', file).then((n:any) => {
          if (this.naan && n && n > 0 && Number(n) !== Number(this.naan)) {
            // show diallof and on confirmation go achead for handleNewWorksheet
            this.handleNewWorksheet(data)

            // this.$mdDialog
            //   .show(
            //     this.$mdDialog
            //       .alert('naanDialog')
            //       .clickOutsideToClose(true)
            //       .title('Incorrect NAAN')
            //       .htmlContent(
            //         `Spreadsheet appears to have been created using a different FIMS/BCID system.
            //        <br/>
            //        <br/>
            //        Spreadsheet says <strong>NAAN = ${n}</strong>
            //        <br/>
            //        System says <strong>NAAN = ${naan}</strong>
            //        <br/>
            //        <br/>
            //        Proceed only if you are SURE that this spreadsheet is being called.
            //        Otherwise, re-load the proper FIMS system or re-generate your spreadsheet template.`,
            //       )
            //       .ok('Proceed Anyways'),
            //   )
            //   .then(() => this.handleNewWorksheet(data));
          } else {
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

  handleNewWorksheet(data:any){}

  // async handleNewWorksheet({ worksheet, file }: { worksheet: string; file: File }) {
  //   const expeditionCodes = new Set<string>();
  //   let timedOut = false;
  
  //   const updateView = (parsedEntireBook = false) => {
  //     this.parsing = false;
  //     if (timedOut && this.expeditionCode) return;
  
  //     if (expeditionCodes.size === 1) {
  //       const expeditionCode = Array.from(expeditionCodes)[0];
  //       if (this.userExpeditions.some(e => e.expeditionCode === expeditionCode)) {
  //         this.expeditionCode = expeditionCode;
  //       }
  //     } else if (expeditionCodes.size > 1 && this.multiExpeditionAllowed) {
  //       this.expeditionCode = MULTI_EXPEDITION;
  //     } else if (parsedEntireBook) {
  //       this.multiExpeditionAllowed = false;
  //     }
  
  //     this.showExpeditions = true;
  //     this.cdr.detectChanges(); // Manually trigger change detection
  //   };
  
  //   const showError = (message: string) => {
  //     // this.snackBar.open(message, 'Close', { duration: 5000 });
  //   };
  
  //   if (worksheet === 'Workbook') {
  //     const parseWorkbook = async () => {
  //       return this.excelService.parseWorkbookWithHeaders(file).subscribe(async(response:any)=>{
  //         const wb = response;
  //         let rowCount = 0;
  //         let hasCoordinateWorksheet = false;
  //         const worksheets: string[] = [];
    
  //         for (const sheetName of wb.SheetNames) {
  //           if (this.setCoordinateWorksheet(sheetName)) {
  //             hasCoordinateWorksheet = true;
  //           }
  //           if (this.currentProject.config.worksheets().includes(sheetName)) {
  //             worksheets.push(sheetName);
  //           }
  //           rowCount += wb.Sheets[sheetName]?.rowCount || 0;
  //         }
    
  //         let fullWorkbookPromise: Observable<any> | undefined;
  //         if (hasCoordinateWorksheet && rowCount <= EXCEL_MAX_ROWS_TO_PARSE) {
  //           fullWorkbookPromise = this.excelService.workbookToJson(file);
  //           fullWorkbookPromise.subscribe((fullWorkbook:any) => {
  //             if (!timedOut && (!this.uploading || this.allDataTypes.every(d => d.file))) {
  //               this.verifyCoordinates(worksheet, fullWorkbook);
  //               this.coordinateWorksheets.push('Workbook');
  //             }
  //           });
  //         }
    
  //         let parsedEntireBook = true;
  //         if (worksheets.length > 0) {
  //           const hasExpeditionCodeSheet = worksheets.some(sheet => wb.Sheets[sheet]?.headers.includes('expeditionCode'));
    
  //           if (hasExpeditionCodeSheet) {
  //             parsedEntireBook = rowCount <= EXCEL_MAX_ROWS_TO_PARSE;
  //             const opts = parsedEntireBook ? {} : { sheetRows: Math.floor(EXCEL_MAX_ROWS_TO_PARSE / worksheets.length) };
  //             fullWorkbookPromise = fullWorkbookPromise || this.excelService.workbookToJson(file, opts);
    
  //             const fullWorkbook:any = await fullWorkbookPromise;
  //             if (!timedOut && (!this.uploading || this.allDataTypes.every(d => d.file))) {
  //               for (const sheet of worksheets) {
  //                 const records = fullWorkbook[sheet] || [];
  //                 records.forEach((record:any) => record.expeditionCode && expeditionCodes.add(record.expeditionCode));
  //               }
  //             }
  //           }
  //         } else {
  //           showError(`Failed to find one of the following worksheets: ${this.currentProject.config.worksheets().join(', ')}`);
  //         }
    
  //         return parsedEntireBook;
  //       })
  //     };
  
  //     const timeout = setTimeout(() => {
  //       timedOut = true;
  //       showError('Timed out attempting to parse Workbook for coordinate verification.');
  //       updateView();
  //     }, 2000);
  
  //     parseWorkbook().then((parsedEntireBook:any) => {
  //       if (!timedOut) clearTimeout(timeout);
  //       updateView(parsedEntireBook);
  //     });
  //   } else {
  //     this.excelService.workbookToJson(file).subscribe((res:any)=>{
  //       const workbook = res;
  //       if (this.setCoordinateWorksheet(worksheet)) {
  //         this.verifyCoordinates(worksheet, workbook);
  //         this.coordinateWorksheets.push(worksheet);
  //       }
    
  //       (workbook.default || []).forEach((record:any) => record.expeditionCode && expeditionCodes.add(record.expeditionCode));
  //       updateView();
  //     })
  //   }
  // }
  

  parseSpreadsheet:any = (regExpression:RegExp, sheetName:string, file:File) => {
    if (this.excelService.isExcelFile(file)) {
      return this.excelService.findExcelCell(file, regExpression, sheetName).subscribe((match:any) =>
        match
          ? match
              .toString()
              .split('=')[1]
              .slice(0, -1)
          : match,
      );
    }
  
    return Promise.resolve();
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { UploadComponent } from '../../../shared/upload/upload.component';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [CommonModule, RouterLink, NgbNavModule, UploadComponent],
  templateUrl: './validation.component.html',
  styleUrl: './validation.component.scss'
})
export class ValidationComponent implements OnDestroy{
  // Injectors
  projectService = inject(ProjectService);
  authService = inject(AuthenticationService);
  expeditionService = inject(ExpeditionService);
  
  // Variables
  private destroy$ = new Subject<void>();
  currentUser:any;
  currentProject:any;
  isLoading:boolean = true;
  activeTab:string = 'load';
  allDataTypes:Array<any> = [];
  allExpeditions:Array<any> = [];
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
    console.log('========libraryStrategies=====',this.fastq.libraryStrategies);
    console.log('======librarySources=======',this.fastq.librarySources);
    console.log('======librarySelections=======',this.fastq.librarySelections);
    console.log('======platforms=======',this.fastq.platforms);
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
    console.log('===event======',val);
    const platformData = this.fastq.platforms.find((item:any)=> item.name == val);
    if(platformData)
      this.fastq.models = platformData.data
  }

  onExpeditionChange(event:any){
    const val = event.target.value;
    console.log('===val====',val);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { UploadComponent } from '../../../../shared/upload/upload.component';

@Component({
  selector: 'app-fastq-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadComponent],
  templateUrl: './fastq-form.component.html',
  styleUrl: './fastq-form.component.scss'
})
export class FastqFormComponent implements OnChanges{
  @Input() config!:ProjectConfig;
  @Input() fastqMetadataForm!:FormGroup;

  // Fastq Variables
  fastq: any = {
    libraryStrategies: [],
    librarySources: [],
    librarySelections: [],
    platforms: [],
    models: []
  };

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['config']?.currentValue){
      const config:ProjectConfig = changes['config'].currentValue;
      this.fastq.libraryStrategies = config.getList('libraryStrategy').fields;
      this.fastq.librarySources = config.getList('librarySource').fields;
      this.fastq.librarySelections = config.getList('librarySelection').fields;
      this.fastq.platforms = config.getList('platform').fields
        .reduce((val:any, f:any) => {
          const newObj:any = {};
          newObj['name'] = f.value;
          newObj['data'] = config.getList(f.value).fields.map((field:any) => field.value);
          val.push(newObj)
          return val;
        }, []);
    }
  }

  onPlatformsChange(event:any){
    const val = event.target.value;
    const platformData = this.fastq.platforms.find((item:any)=> item.name == val);
    if(platformData) this.fastq.models = platformData.data
  }

  fileChanged(event:any){
    this.form['file'].setValue(event.file);
    this.form['file'].updateValueAndValidity();
  }

  get form(){ return this.fastqMetadataForm.controls; }

}

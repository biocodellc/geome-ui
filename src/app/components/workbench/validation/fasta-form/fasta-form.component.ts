import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { UploadComponent } from '../../../../shared/upload/upload.component';

@Component({
  selector: 'app-fasta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UploadComponent ],
  templateUrl: './fasta-form.component.html',
  styleUrl: './fasta-form.component.scss'
})
export class FastaFormComponent implements OnChanges{
  // Injectors and Variables
  fb = inject(FormBuilder);
  markers:any[] = [];
  @Input() config!:ProjectConfig;
  @Input() fastaForm:FormArray = this.fb.array([]);
  @Output() onFileChange:EventEmitter<any> = new EventEmitter();

  constructor(){
    this.addFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['config']?.currentValue){
      this.markers = this.config.getList('markers').fields || [];
    }
  }

  addFields() {
    this.fastaForm.push(this.fb.group({
      file: ['', Validators.required],
      marker: ['', Validators.required]
    }));
    console.log(this.fastaForm.value);
  }

  fileChanged(event:any, idx:number){
    console.log(this.form);
  }

  get form(){ return this.fastaForm.value; }
}

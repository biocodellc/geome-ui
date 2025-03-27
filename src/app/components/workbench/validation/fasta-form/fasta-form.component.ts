import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  @Input() fastaForm!:FormGroup;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['config']?.currentValue){
      this.markers = this.config.getList('markers').fields || [];
    }
    if(changes['fastaForm']) this.addFields();
  }

  addFields() {
    const fastaArr = this.fastaArr;
    fastaArr.push(this.newFields());
  }

  removeFields(){
    this.fastaArr.removeAt(this.fastaArr.value.length - 1);
  }

  newFields() {
    return this.fb.group({
      file: ['', Validators.required],
      marker: ['', Validators.required]
    });
  }

  fileChanged(event:any, idx:number){
    const formGrp = this.fastaArr.controls[idx] as FormGroup;
    formGrp.controls['file'].setValue(event.file);
    formGrp.controls['file'].updateValueAndValidity();
  }

  get formControl(){ return this.fastaArr?.controls as FormGroup[]; };

  get fastaArr():any{ return this.fastaForm?.get('fastaArr') as FormArray; }
}
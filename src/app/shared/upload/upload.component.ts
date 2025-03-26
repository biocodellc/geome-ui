import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  fileName:string = '';
  selectedFile!:File;
  replaceChecked:boolean = false;
  @Input() sectionData:any;
  @Output() onFileChange:EventEmitter<any> = new EventEmitter();

  onFileSelect(event:any){
    console.log('=====event====',event.target.files);
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile.name;
    const eventData = { worksheet : this.sectionData.label, file:this.selectedFile, reload: false };
    this.onFileChange.emit(eventData);
  }

  fileTypes() {
    if (this.sectionData.label === 'Workbook') return ".xls,.xlsx";
    else if(this.sectionData.label === 'FASTQ Filenames') return ".txt";
    else if(this.sectionData.label === 'Fasta Data') return ".fa,.mpfa,.fna,.fsa,.fas,.fasta,.txt";
    return ".txt,.csv,.tsv";
  }
}

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
  file:any;
  fileName:string = '';
  selectedFile!:File;
  fileUrl:string = '';
  replaceChecked:boolean = false;
  @Input() sectionData:any;
  @Output() onFileChange:EventEmitter<any> = new EventEmitter();

  onFileSelect(event:any){
    console.log('=====event====',event.target.files);
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile.name;
    // const reader:any = new FileReader();
    // reader.onload = async ()=> this.fileUrl = reader.result;
    // reader.readAsDataURL(this.selectedFile);
  }

  fileTypes() {
    if (this.sectionData.label === 'Workbook') {
      return ".xls,.xlsx";
    }
    return ".txt,.csv,.tsv";
  }
}

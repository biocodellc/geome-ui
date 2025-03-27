import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent implements OnChanges{
  fileName:string = '';
  selectedFile!:File;
  replaceData:boolean = false;
  @Input() sectionData:any;
  @Input() onlyValidate!:boolean;
  @Output() onFileChange:EventEmitter<any> = new EventEmitter();

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['onlyValidate']?.currentValue === false) this.replaceData = false;
  }

  onFileSelect(event:any){
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile.name;
    const eventData = { worksheet : this.sectionData.label, file:this.selectedFile, reload: this.replaceData };
    this.onFileChange.emit(eventData);
  }

  fileTypes() {
    if (this.sectionData.label === 'Workbook') return ".xls,.xlsx";
    else if(this.sectionData.label === 'FASTQ Filenames') return ".txt";
    else if(this.sectionData.label === 'Fasta Data') return ".fa,.mpfa,.fna,.fsa,.fas,.fasta,.txt";
    return ".txt,.csv,.tsv";
  }
}

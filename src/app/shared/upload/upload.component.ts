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
  eventData:any;
  @Input() sectionData:any;
  @Input() validateOnly!:boolean;
  @Output() onFileChange:EventEmitter<any> = new EventEmitter();

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['validateOnly']?.currentValue === false) this.replaceData = false;
  }

  onFileSelect(event:any){
    this.selectedFile = event.target.files[0];
    this.fileName = this.selectedFile.name;
    this.eventData = { worksheet : this.sectionData.label, file:this.selectedFile, reload: this.replaceData };
    this.onFileChange.emit(this.eventData);
  }

  onReplcaeChange(event:any){
    const checked = event.target.checked;
    if(checked == this.eventData.reload) return;
    this.eventData.reload = checked;
    this.onFileChange.emit(this.eventData);
  }

  fileTypes() {
    if (this.sectionData.label === 'Workbook') return ".xls,.xlsx";
    else if(this.sectionData.label === 'FASTQ Filenames') return ".txt";
    else if(this.sectionData.label === 'Fasta Data') return ".fa,.mpfa,.fna,.fsa,.fas,.fasta,.txt";
    return ".txt,.csv,.tsv";
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPopoverModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent implements OnChanges{
  // Decorator Variables
  @Input() sectionData:any;
  @Input() validateOnly!:boolean;
  @Output() onFileChange:EventEmitter<any> = new EventEmitter();
  @Output() replaceCheckChange:EventEmitter<any> = new EventEmitter();
  
  // Variables
  fileName:string = '';
  selectedFile!:File;
  replaceData:boolean = false;
  eventData:any = { worksheet : '', file: undefined, reload: false };

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
    if(checked == this.eventData.reload || !this.eventData.file) return;
    this.eventData.reload = checked;
    this.replaceCheckChange.emit(this.eventData);
  }

  fileTypes() {
    if (this.sectionData.label === 'Workbook') return ".xls,.xlsx";
    else if(this.sectionData.label === 'FASTQ Filenames') return ".txt";
    else if(this.sectionData.label === 'Fasta Data') return ".fa,.mpfa,.fna,.fsa,.fas,.fasta,.txt";
    return ".txt,.csv,.tsv";
  }

  getPopoverData(label:string){
    if(label !== 'Workbook') return `All existing ${label} data will be removed and replaced with the data in this worksheet`
    else
      return 'For each data worksheet found in this workbook. All existing data will be removed and replaced with the data in the workbook. Data worksheets not found in this workbook will not be removed.  It is highly reccomended to first run the "Only validate data" option (above) and fix errors, before replacing expedition data.';
  }
}

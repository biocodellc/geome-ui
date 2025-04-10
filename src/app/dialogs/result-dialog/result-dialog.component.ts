import { CommonModule } from '@angular/common';
import { Component, inject, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { ResultValidationsComponent } from '../../shared/result-validations/result-validations.component';

@Component({
  selector: 'app-result-dialog',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ResultValidationsComponent],
  templateUrl: './result-dialog.component.html',
  styleUrl: './result-dialog.component.scss'
})
export class ResultDialogComponent {
  activeModal = inject(NgbActiveModal);
  dom = inject(DomSanitizer);
  @Input() public results:any = {};

  sanitizeHtml(html:any){
    return this.dom.sanitize(SecurityContext.HTML, html);
  }

  get isLoading(){
    if(this.results?.validation && Object.keys(this.results?.validation).length) return false;
    else return true
  }
}

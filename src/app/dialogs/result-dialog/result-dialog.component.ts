import { CommonModule } from '@angular/common';
import { Component, inject, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbAccordionModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-result-dialog',
  standalone: true,
  imports: [CommonModule, LoaderComponent, NgbAccordionModule],
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
}

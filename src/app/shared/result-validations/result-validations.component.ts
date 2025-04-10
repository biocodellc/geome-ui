import { CommonModule } from '@angular/common';
import { Component, inject, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-result-validations',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule],
  templateUrl: './result-validations.component.html',
  styleUrl: './result-validations.component.scss'
})
export class ResultValidationsComponent {
  dom = inject(DomSanitizer);
  @Input() results:any;

  sanitizeHtml(html:any){
    return this.dom.sanitize(SecurityContext.HTML, html);
  }
}

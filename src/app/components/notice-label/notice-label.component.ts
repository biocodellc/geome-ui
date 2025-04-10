import { Component, inject, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-notice-label',
  standalone: true,
  imports: [NgbModalModule],
  templateUrl: './notice-label.component.html',
  styleUrl: './notice-label.component.scss'
})
export class NoticeLabelComponent {
  modalService = inject(NgbModal);

  showNoticeMessage(content:TemplateRef<any>){
    this.modalService.open(content, { centered: true, animation: true });
  }
}

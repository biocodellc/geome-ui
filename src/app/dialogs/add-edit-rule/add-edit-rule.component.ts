import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-edit-rule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-edit-rule.component.html',
  styleUrl: './add-edit-rule.component.scss'
})
export class AddEditRuleComponent {
  activeModal = inject(NgbActiveModal);
  @Input() public modalData:any;

  constructor(){
    setTimeout(() => {
      console.log('=======data in modal=====',this.modalData);
    }, 2000);
  }
}

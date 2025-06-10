import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-time-out',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-time-out.component.html'
})
export class UserTimeOutComponent {
  activeModal = inject(NgbActiveModal);
}

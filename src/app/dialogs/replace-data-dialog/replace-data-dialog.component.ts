import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-replace-data-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './replace-data-dialog.component.html',
  styleUrl: './replace-data-dialog.component.scss'
})
export class ReplaceDataDialogComponent {
  activeModal = inject(NgbActiveModal);
  @Input() reloadSheets:string[] = [];
}

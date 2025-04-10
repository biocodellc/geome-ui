import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.scss'
})
export class PaginatorComponent {
  @Input() paginator:paginatorData = { collectionSize: 0, page: 0, pageSize: 10 };
  @Output() pageChange:EventEmitter<any> = new EventEmitter();
}

interface paginatorData{
  collectionSize: number,
  page: number,
  pageSize: number
}
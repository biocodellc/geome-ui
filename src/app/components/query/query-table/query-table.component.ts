import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-query-table',
  standalone: true,
  imports: [CommonModule, PaginatorComponent, FormsModule],
  templateUrl: './query-table.component.html',
  styleUrl: './query-table.component.scss'
})
export class QueryTableComponent implements OnChanges{
  // Injectors
  dummyDataService = inject(DummyDataService)

  @Input() queryResult:any[] = [];
  @Input() entity:string = '';
  formattedQueryResult:any = [];
  headers:any[] = [];
  rowsArr: number[] = [ 25, 50, 100 ];
  pageSize:number = 50;
  paginatorData:any = { collectionSize: 0, page: 0, pageSize: 50 };

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['queryResult']?.currentValue) this.updateValues();
    if(changes['entity']?.currentValue) this.updateHeader();
  }

  updateValues(){
    this.paginatorData = { collectionSize: this.queryResult.length, page: 1, pageSize: 50 };
    this.onPageChange();
  }

  updateHeader(){
    const allHeaders:any = this.dummyDataService.getQueryTableCols();
    this.headers = allHeaders[this.entity];
  }

  onPageChange(){
    this.formattedQueryResult = this.queryResult.slice(
			(this.paginatorData.page - 1) * this.paginatorData.pageSize,
			(this.paginatorData.page - 1) * this.paginatorData.pageSize + this.paginatorData.pageSize,
		);
  }

  get pages(){
    const pages = Math.ceil(this.paginatorData.collectionSize / this.paginatorData.pageSize);
    return Array(pages).fill('');
  }

  onRowsLengthChange(){
    this.paginatorData.pageSize = Number(this.pageSize);
    this.onPageChange();
  }

  detailedView(bcid:string){
    const url = window.location.origin + '/record/' + bcid;
    window.open(url, '_blank')?.focus();
  }
}

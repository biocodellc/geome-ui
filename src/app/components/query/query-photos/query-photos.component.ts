import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { PaginatorComponent } from '../../../shared/paginator/paginator.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-query-photos',
  standalone: true,
  imports: [CommonModule, GalleryModule, LightboxModule, PaginatorComponent],
  templateUrl: './query-photos.component.html',
  styleUrl: './query-photos.component.scss'
})
export class QueryPhotosComponent implements OnChanges{
  @Input() queryResult:any[] = [];
  @Input() entity:string = '';
  photosArr:any[] = [];
  formattedPhotoArr:any = [];
  paginatorData:any = { collectionSize: 0, page: 0, pageSize: 50 };

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['queryResult'].currentValue && changes['queryResult'].currentValue?.length){
      const data = cloneDeep(this.queryResult);
      const groupedData = this.groupByKey(data, this.entity === 'Sample_Photo' ? 'materialSampleID' : 'eventID');
      this.photosArr = Object.entries(groupedData).map(([key, value]) => ({
        id: key,
        group: value
      }));
      this.paginatorData = { collectionSize: this.photosArr.length, page: 1, pageSize: 50 };
      this.onPageChange();
    }
  }

  groupByKey(items: any[], groupBy:string): Record<string, any[]> {
    return items.reduce((acc, item) => {
      const key = item[groupBy];
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }

  onPageChange(){
    this.formattedPhotoArr = this.photosArr.slice(
			(this.paginatorData.page - 1) * this.paginatorData.pageSize,
			(this.paginatorData.page - 1) * this.paginatorData.pageSize + this.paginatorData.pageSize,
		);
  }

  getHighestQualityPhoto(group:any[]):string {
    if (group && group.length > 0) {
      // Find the photo with the highest quality_score
      var highestQualityPhoto = group.reduce(function (prev, current) {
        return (prev.quality_score || 0) > (current.quality_score || 0) ? prev : current;
      });
      return highestQualityPhoto.img128;
    }
    return ''; // Return an empty string if the group is empty or undefined
  };

  viewDetails(item:any){
    const bcid = this.entity === 'Sample_Photo' ? item.group[0].sampleBcid : item.group[0].eventBcid;
    const url = window.location.origin + '/record/' + bcid;
    window.open(url, '_blank')?.focus();
  }
}

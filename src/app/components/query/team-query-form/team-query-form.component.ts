import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MapBoundingComponent } from '../../../shared/map-bounding/map-bounding.component';
import { QueryParams } from '../../../../helpers/scripts/queryParam';
import { QueryService } from '../../../../helpers/services/query.service';
import { FormsModule } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { MapQueryService } from '../../../../helpers/services/map-query.service';

const SOURCE:any = [
  'Event.eventID',
  'Sample.eventID',
  'Sample.materialSampleID',
  'Event.locality',
  'Event.country',
  'Event.yearCollected',
  'Event.decimalLatitude',
  'Event.decimalLongitude',
  'Sample.genus',
  'Sample.specificEpithet',
  'Event.bcid',
  'Sample.bcid',
  'Sample.phylum',
  'Sample.scientificName',
  'Diagnostics.diseaseDetected',
  'Diagnostics.diseaseTested',
  'Diagnostics.materialSampleID',
  'Diagnostics.bcid',
  'expeditionCode',
];

@Component({
  selector: 'app-team-query-form',
  standalone: true,
  imports: [CommonModule, MapBoundingComponent, FormsModule],
  templateUrl: './team-query-form.component.html',
  styleUrl: './team-query-form.component.scss'
})

export class TeamQueryFormComponent {
  // Decorator
  @Output() queryResult:EventEmitter<any> = new EventEmitter();

  // Injectors
  queryService = inject(QueryService);
  mapQueryService = inject(MapQueryService);
  
  // Variables
  destroy$:Subject<any> = new Subject();
  params:QueryParams = new QueryParams();

  queryJson(){
    const entity = 'Event';
    const selectEntities = ['Event', 'Sample'];
    this.queryService.queryJson(
      this.params.buildQuery(selectEntities, SOURCE.join()),
      'Diagnostics',
      0,
      10000,
    ).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.queryResult.emit(res.data);
      this.mapQueryService.clearBounds();
      this.mapQueryService.setQueryMarkers(res.data, entity);
    })
  }
}

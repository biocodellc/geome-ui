import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { MapComponent } from '../../components/query/map/map.component';
import { MapQueryService } from '../../../helpers/services/map-query.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { take } from 'rxjs';

@Component({
  selector: 'app-upload-map-dialog',
  standalone: true,
  imports: [CommonModule, MapComponent],
  templateUrl: './upload-map-dialog.component.html',
  styleUrl: './upload-map-dialog.component.scss'
})
export class UploadMapDialogComponent {
  @Input() scope:any;
  activeModal = inject(NgbActiveModal);
  mapQueryService = inject(MapQueryService);

  constructor(){  
    this.mapQueryService.mapInitialized.pipe(take(1)).subscribe(()=>{
      if(this.scope)
        this.mapQueryService.setMarkers(this.scope.d, this.scope.latColumn, this.scope.lngColumn);
    })
  }
}

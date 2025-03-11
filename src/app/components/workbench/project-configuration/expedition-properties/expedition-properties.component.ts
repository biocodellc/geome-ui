import { Component, inject } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { CommonModule } from '@angular/common';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { ToastrService } from 'ngx-toastr';
import { DummyDataService } from '../../../../../helpers/services/dummy-data.service';

@Component({
  selector: 'app-expedition-properties',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expedition-properties.component.html',
  styleUrl: './expedition-properties.component.scss'
})
export class ExpeditionPropertiesComponent {
  // Injectors
  toastr = inject(ToastrService);
  projectService = inject(ProjectService);
  dummyDataService = inject(DummyDataService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$: Subject<any> = new Subject();
  currentProject: any;
  metaDataList: Array<any> = [];
  changedItems: Array<any> = [];

  constructor() {
    this.dummyDataService.loadingState.next(true);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) this.getProjectConfigs(res.projectConfiguration.id);
    })
  }

  getProjectConfigs(id: number) {
    this.projectConfService.get(id).pipe(take(1), takeUntil(this.destroy$)).subscribe((res: any) => {
      this.currentProject = res;
      this.metaDataList = this.currentProject.config.expeditionMetadataProperties;
      this.dummyDataService.loadingState.next(false);
    })
  }

  onRequireChange(event: any, item: any) {
    const val = event.target.checked;
    const itemVal = this.metaDataList.find((e: any) => e.name == item.name);
    if (!itemVal) return;
    const idx = this.changedItems.findIndex((e: any) => e = item.name);
    if (itemVal.required == val && idx != -1) {
      this.changedItems = this.changedItems.slice(0, idx).concat(this.changedItems.slice(idx + 1));
    }
    else this.changedItems.push(item.name);
  }

  saveConfig() {
    const projectData:any = { ...this.currentProject };
    const updatedMetaData = this.metaDataList.map((item:any)=>{
      if(this.changedItems.includes(item.name)) item.required = !item.required;
      return item;
    })
    projectData.config.expeditionMetadataProperties = updatedMetaData;
    this.projectConfService.save(projectData).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.changedItems = [];
      this.toastr.success('Configuration Updated!');
    })
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { Subject, take, takeUntil } from 'rxjs';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { DummyDataService } from '../../../../../helpers/services/dummy-data.service';
import { NetworkService } from '../../../../../helpers/services/network.service';

@Component({
  selector: 'app-entity-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './entity-details.component.html',
  styleUrl: './entity-details.component.scss'
})
export class EntityDetailsComponent implements OnDestroy{
  // Injectors
  projectService = inject(ProjectService);
  activatedRoute = inject(ActivatedRoute);
  dummyDataService = inject(DummyDataService);
  networkService = inject(NetworkService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  destroy$:Subject<any> = new Subject();
  currentProject:any;
  config!:ProjectConfig;
  networkConfig:any;
  paramData:any;
  entity:any;

  selectedAttributes:Array<any> = [];
  requiredUris:Array<any> = [];
  selectedAttributeMap:any = {};
  orderedAttributes:Array<any> = [];

  cachedRequiredAttributes:any;

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.currentProject = res;
      if(this.currentProject){
        this.getProjectConfigs(this.currentProject.projectConfiguration.id);
      }
    })
  }

  getProjectConfigs(id:number){
    this.projectConfService.get(id).pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.config = res.config;
      this.extractParams();
    })
  }

  extractParams(){
    this.activatedRoute.params.pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res.entity && res.type){
        this.paramData = { ...res };
        this.entity = this.config.entities.find((item:any) => item.conceptAlias == res.entity);
        if(this.entity){
          this.getNetworkConfigs();
          this.selectedAttributes = this.entity[res.type];
          this.orderedAttributes = this.selectedAttributes.map(a => a.uri)
          console.log('=========data list====',this.selectedAttributes);
        }
      }
      this.dummyDataService.loadingState.next(false);
    })
  }

  getNetworkConfigs(){
    this.networkService.getConfig().pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.networkConfig = res;
      const requiredAtt = this.requiredAttributes();
      console.log(requiredAtt);
      this.requiredUris = requiredAtt ? requiredAtt.map((a:any) => a.uri) : [];
      this.onAllCheckboxChange(true);
    })
  }

  availableAttributes() {
    return this.networkConfig.entities.find((e:any) => e.conceptAlias === this.paramData.entity).attributes;
  }

  requiredAttributes() {
    if (this.cachedRequiredAttributes) return this.cachedRequiredAttributes;

    const requiredAttributes = this.networkConfig.requiredAttributesForEntity(
      this.entity.conceptAlias,
    );

    const ne = this.networkConfig.entities.find(
      (entity:any) => entity.conceptAlias === this.entity.conceptAlias,
    );

    const addUniqueKey = (entity:any) => {
      const attribute = ne.attributes.find((a:any) => a.column === entity.uniqueKey);
      requiredAttributes.push(attribute);
      if (!this.entity.attributes.find((attr:any) => attribute.uri === attr.uri)) {
        this.entity.attributes.push(attribute);
      }
    };

    if (!requiredAttributes.find((a:any) => a.column === this.entity.uniqueKey)) {
      addUniqueKey(this.entity);
    }

    if (ne.uniqueKey !== this.entity.uniqueKey) {
      const i = requiredAttributes.findIndex((a:any) => a.column === ne.uniqueKey);
      if (i > -1) requiredAttributes.splice(i, 1);
    }

    if (this.entity.parentEntity) {
      const p = (this.config || this.networkConfig).entities.find(
        entity => this.entity.parentEntity === entity.conceptAlias,
      );

      if (!requiredAttributes.find((a:any) => a.column === p.uniqueKey)) {
        addUniqueKey(p);
      }
    }

    this.cachedRequiredAttributes = requiredAttributes;
    return this.cachedRequiredAttributes;
  }

  orderedIndex(item:any) {
    const i = this.orderedAttributes.indexOf(item.uri);
    return i === -1 ? 'N/A' : i;
  }

  onAllCheckboxChange(event:any){
    const isChecked = event?.target?.checked || event;
    this.selectedAttributes.forEach((item:any)=>{
      this.selectedAttributeMap[item.uri] = isChecked || this.requiredUris.includes(item.uri) ? item : undefined;
      const idx = this.orderedAttributes.findIndex((att:any) => att == item.uri);
      if(!isChecked && idx && !this.requiredUris.includes(item.uri))
        this.orderedAttributes = this.orderedAttributes.slice(0, idx).concat( this.orderedAttributes.slice(idx + 1) )
      else if(isChecked && !this.requiredUris.includes(item.uri))
        this.orderedAttributes.push(item.uri);
    })
  }

  get selectedAttUris(){ return Object.values(this.selectedAttributeMap).map((att:any) => att?.uri).filter((att:any) => att); }
  
  get orderIdxArr(){ return this.orderedAttributes } //.map((att:any) => att?.uri).filter((att:any) => att); }

  onSelectChange(event:any, attribute:any){
    console.log('=======old order====', { ...this.orderedAttributes });
    const isChecked = event.target.checked;
    this.selectedAttributeMap[attribute.uri] = isChecked ? attribute : undefined;
    const idx = this.orderedAttributes.findIndex((att:any) => att == attribute.uri);
    if(!isChecked && idx && !this.requiredUris.includes(attribute.uri))
      this.orderedAttributes = this.orderedAttributes.slice(0, idx).concat( this.orderedAttributes.slice(idx + 1) )
    else if(isChecked && !this.requiredUris.includes(attribute.uri))
      this.orderedAttributes.push(attribute.uri);
    console.log('=======new order====', { ...this.orderedAttributes });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

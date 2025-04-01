import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { NetworkService } from '../../../../helpers/services/network.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { ProjectConfig } from '../../../../helpers/models/projectConfig.model';
import { QueryService } from '../../../../helpers/services/query.service';
import { QueryParams } from '../../../../helpers/scripts/queryParam';
import { ProjectConfigurationService } from '../../../../helpers/services/project-config.service';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { MapQueryService } from '../../../../helpers/services/map-query.service';
import { MapBoundingComponent } from '../../../shared/map-bounding/map-bounding.component';
import { FilterButtonComponent } from '../filter-button/filter-button.component';
import { MultiselectDropdownComponent } from '../../../shared/multiselect-dropdown/multiselect-dropdown.component';

const SOURCE:Array<any> = [
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
  'fastqMetadata.tissueID',
  'fastqMetadata.identifier',
  'fastqMetadata.bioSample',
  'fastqMetadata.libraryLayout',
  'fastqMetadata.librarySource',
  'fastqMetadata.librarySelection',
  'fastqMetadata.bcid',
  'Event.bcid',
  'Sample.bcid',
  'Sample.phylum',
  'Sample.scientificName',
  'Tissue.materialSampleID',
  'Tissue.tissueID',
  'Tissue.bcid',
  'Tissue.tissueType',
  'Tissue.tissuePlate',
  'Tissue.tissueWell',
  'Sample_Photo.bcid',
  'Sample_Photo.photoID',
  'Sample_Photo.materialSampleID',
  'Sample_Photo.qualityScore',
  'Sample_Photo.photographer',
  'Sample_Photo.img128',
  'Event_Photo.bcid',
  'Event_Photo.photoID',
  'Event_Photo.eventID',
  'Event_Photo.qualityScore',
  'Event_Photo.photographer',
  'Event_Photo.img128',
  'Diagnostics.bcid',
  'Diagnostics.materialSampleID',
  'Diagnostics.diagnosticsID',
  'Diagnostics.measurementType',
  'Diagnostics.measurementValue',
  'Diagnostics.measurementUnit',
  'Diagnostics.diseaseTested',
  'Diagnostics.diseaseDetected',
  'Diagnostics.derivedDataType',
  'Diagnostics.derivedDataFormat',
  'Diagnostics.derivedDataURI',
  'Diagnostics.derivedDataFilename',
  'expeditionCode',
];

const SELECT_ENTITIES:any = {
  Event: [],
  Sample: ['Event'],
  Tissue: ['Event', 'Sample'],
  fastqMetadata: ['Event', 'Sample', 'Tissue'],
  Sample_Photo : ['Event', 'Sample'],
  Event_Photo : ['Event'],
  Diagnostics : ['Event', 'Sample']
};

@Component({
  selector: 'app-query-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MapBoundingComponent, FilterButtonComponent, MultiselectDropdownComponent],
  templateUrl: './query-form.component.html',
  styleUrl: './query-form.component.scss'
})
export class QueryFormComponent implements OnChanges,OnDestroy{
  // Decorators
  @Input() q:any;
  @Output() queryResult:EventEmitter<any> = new EventEmitter();

  // Injectors
  toastr = inject(ToastrService);
  queryService = inject(QueryService);
  projectService = inject(ProjectService);
  networkService = inject(NetworkService);
  mapQueryService = inject(MapQueryService);
  expeditionService = inject(ExpeditionService);
  projectConfigService = inject(ProjectConfigurationService);

  // Variables
  destroy$: Subject<any> = new Subject();
  networkConfig:any;

  // Other Variables
  isLoading:boolean = false;
  moreSearchOptions:boolean = false;
  loadingExpeditions:boolean = false;
  allProjects:Array<any> = [];
  allProjectsName:Array<any> = [];
  teams: Array<any> = [];
  individualProjects: Array<any> = [];
  expeditions:Array<any> = [];
  queryEntities: Array<string> = ['Event', 'Sample', 'Tissue', 'Fastq', 'Sample_Photo', 'Event_Photo', 'Diagnostics'];
  phylums: Array<any> = [];
  countries: Array<any> = [];
  markers: Array<any> = [];

  config!: ProjectConfig;
  entity:string = '';
  configNames:Array<any> = [];
  entitiesList: Array<any> = [];
  params:QueryParams = new QueryParams();
  requestedQuery:string | undefined;
  selectedTeam: string = '';
  selectedIndividualProject: string = '';

  // Extra NgModels

  constructor(){
    this.entity = this.queryEntities[1];
    this.moreSearchOptions = true;
    this.getProjects();
    this.getNetworkConfigs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['q'] && changes['q'].currentValue){
      this.requestedQuery = changes['q'].currentValue
      this.params.queryString = this.requestedQuery;
    }
  }

  getProjects(){
    this.projectService.getAllProjectsValue().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        this.allProjects = res;
        this.allProjectsName = this.allProjects.map(proj => proj.projectTitle);
        this.setTeamNames();
      }
    })
  }

  getNetworkConfigs(){
    this.networkService.getConfig().pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.networkConfig = res;
      this.phylums = this.networkConfig.getList('phylum').fields;
      this.countries = this.networkConfig.getList('country').fields;
      this.markers = this.networkConfig.getList('markers').fields;
      this.setNetworkConfig();
    })
  }

  setNetworkConfig() {
    this.config = this.networkConfig;
    this.identifySpecificEntities();
  }

  identifySpecificEntities() {
    this.entitiesList = this.config.entities.map(e => e.conceptAlias);
    if(this.requestedQuery){
      this.requestedQuery = undefined;
      this.queryJson();
    }
  }

  setTeamNames(){
    const names = new Set();
    this.allProjects.forEach(p => {
      if (p.projectConfiguration.networkApproved === true) {
        names.add(p.projectConfiguration.name);
      }
    });
    this.configNames = [...names];
  }

  onTeamSelect(event:{ item:any, value:[] , isDeSelected?:boolean }){
    // Clearing Project's related Data and Update ParamProjects
    if(this.individualProjects.length){
      this.individualProjects = this.params.projects = this.expeditions = [];
    }
    this.teams = event.value;
    this.changeParamProjects(event);

    // Setting Configs
    if(this.teams.length == 1){
      const project = this.allProjects.find((p:any)=> p.projectConfiguration.name == this.teams[0]);
      this.callConfigService(project);
    }
    else this.setNetworkConfig();
  }

  onProjChange(event:{ item:any, value:[], isDeSelected?:boolean }) {
    // Clearing Teams's related Data and Update ParamProjects
    if (this.teams.length) {
      this.teams = this.params.projects = [];
    }
    this.individualProjects = event.value;
    this.changeParamProjects(event);

    // Setting Configs
    if (this.individualProjects.length == 1) {
      this.getExpeditions();
      this.identifySpecificConfig();
    } else {
      this.expeditions = [];
      this.setNetworkConfig();
    }
  }

  // Setting and Removing Teams's Project
  changeParamProjects(event:{ item:any, value:[], isDeSelected?:boolean }){
    this.allProjects.findIndex((p:any, i:number)=>{
      if(p.projectConfiguration.name == event.item && event.isDeSelected){
        const idx = this.params.projects.findIndex(item => item.projectId == p.projectId);
        this.params.projects.splice(idx, 1);
      }
      else if(p.projectConfiguration.name == event.item && !event.isDeSelected) this.params.projects.push(p);
    })
  }

  onDropdownChange(event:any, item:string){
    const val = event.target.value.trim();
    this.setDataRelatedToVariable(item, val);
  }

  private setDataRelatedToVariable(variable:string, data:any){
    switch(variable){
      case 'teams':
        if(this.individualProjects.length){
          this.selectedIndividualProject = '';
          this.individualProjects = this.params.projects = this.expeditions = [];
        }
        this.teams = [data];
        this.allProjects.forEach((p:any)=>{
          if(p.projectConfiguration.name == data) this.params.projects.push(p);
        })
        if(this.teams.length == 1){
          const project = this.allProjects.find((p:any)=> p.projectConfiguration.name == this.teams[0]);
          this.callConfigService(project);
        }
        else this.setNetworkConfig();
        break;
      case 'individualProj':
        if(this.teams.length){
          this.selectedTeam = '';
          this.teams = this.params.projects = [];
        }
        this.params.expeditions = [];
        const projectData = this.allProjects.find(p => p.projectTitle == data);
        this.individualProjects = [projectData];
        this.allProjects.forEach((p:any) => {
          if (p.projectId === projectData.projectId) this.params.projects.push(p);
        });
        if (this.individualProjects.length == 1) {
          this.getExpeditions();
          this.identifySpecificConfig();
        } else {
          this.expeditions = [];
          this.setNetworkConfig();
        }
        break ;
      default:
        break;
    }
  }

  identifySpecificConfig() {
    const projData = this.allProjects.find(proj => proj.projectTitle == this.individualProjects[0]);
    const specificConfigName = projData.projectConfiguration.name;
    const matchingProjectForConfigRetrieval = this.allProjects.find(p => p.projectConfiguration.name === specificConfigName);
    this.callConfigService(matchingProjectForConfigRetrieval);
  }

  callConfigService(projectMatch:any) {
    this.projectConfigService.get(projectMatch.projectConfiguration.id).subscribe((res:any) => {
      this.config = res.config;
      this.identifySpecificEntities();
    });
  }

  getExpeditions() {
    this.loadingExpeditions = true;
    const projData = this.allProjects.find(proj => proj.projectTitle == this.individualProjects[0]);
    this.expeditionService.getAllExpeditions(projData.projectId).subscribe((data:any) => {
      this.expeditions = data;
      this.loadingExpeditions = false;
    })
  }

  queryJson() {
    const entity = this.entity === 'Fastq' ? 'fastqMetadata' : this.entity;
    this.isLoading = true;
    const entities = this.config.entities
      .filter(e =>
        [
          'Event',
          'Sample',
          'Tissue',
          'Sample_Photo',
          'Event_Photo',
          'Diagnostics',
        ].includes(e.conceptAlias),
      )
      .map(e => e.conceptAlias);
    // this.entitiesForDownload({ entities });
    const selectEntities = SELECT_ENTITIES[entity];
    this.queryService.queryJson(
      this.params.buildQuery(selectEntities, SOURCE.join()),
      entity,
      0,
      10000,
    ).subscribe((res:any)=>{
      console.log(res);
      this.mapQueryService.clearBounds();
      this.mapQueryService.setQueryMarkers(res.data, entity);
      const data = { result: res.data, entities: entities, entity: this.entity };
      this.queryResult.emit(data);
    },
    (err:any) =>{
      const data = { result: [], entities: entities, entity: this.entity };
      this.queryResult.emit(data);
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

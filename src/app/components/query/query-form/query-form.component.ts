import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { NetworkService } from '../../../../helpers/services/network.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { ProjectConfig } from '../../../../helpers/models/projectConfig.model';
import { QueryService } from '../../../../helpers/services/query.service';
import { QueryParams } from '../../../../helpers/scripts/queryParam';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './query-form.component.html',
  styleUrl: './query-form.component.scss'
})
export class QueryFormComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder)
  toastr = inject(ToastrService);
  queryService = inject(QueryService);
  projectService = inject(ProjectService);
  networkService = inject(NetworkService);

  // Variables
  destroy$: Subject<any> = new Subject();
  queryForm!: FormGroup;
  networkConfig:any;

  // Other Variables
  isLoading:boolean = false;
  moreSearchOptions:boolean = false;
  allProjects:Array<any> = [];
  teams: Array<any> = [];
  individualProjects: Array<any> = [];
  queryEntities: Array<string> = ['Event', 'Sample', 'Tissue', 'Fastq', 'Sample_Photo', 'Event_Photo', 'Diagnostics'];
  phylums: Array<any> = [];
  countries: Array<any> = [];
  markers: Array<any> = [];

  config!: ProjectConfig;
  entitiesList: Array<any> = [];
  params:QueryParams = new QueryParams();

  constructor(){
    this.moreSearchOptions = true;
    this.initForm();
    this.getNetworkConfigs();
    console.log('==========params=====',this.params);
  }

  initForm(){
    this.queryForm = this.fb.group({
      entity: [''],
      teams: [[]],
      individualProjects: [[]],
      expeditions: [[]], // moreSearchOptions == true
      
      // All under params
        queryString: [''],
          // and moreSearchOptions == false
          materialSampleID: [''],
          country:  [''], //dropdown
          fromYear: [''],
          toYear: [''],
          phylum: [''], //dropdown
          genus: [''],
          specificEpithet: [''],
          
      // and moreSearchOptions == true
      eventFilters: this.fb.array([]),
      sampleFilters: this.fb.array([]),
      tissueFilters: this.fb.array([]),
      samplePhotoFilters: this.fb.array([]),
      eventPhotoFilters: this.fb.array([]),

      // All Under params
        bounds: [{ northEast: { lat: '', lng: '' }, southWest: { lat: '', lng: '' } }],
        // checkboxes
        isMappable: [false],
        hasCoordinateUncertaintyInMeters: [false],
        hasPermitInfo: [false],
        hasTissue: [false],
        hasSamplePhoto: [false],
        hasEventPhoto: [false],
        hasFasta: [false],
        hasSRAAccessions: [false],
        // Input
        marker: ['']
    })
  }

  getProjects(){
    this.projectService.getAllProjectsValue().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.allProjects = res;
    })
  }

  getNetworkConfigs(){
    this.networkService.getConfig().pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      console.log(res,'======');
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
  }

  queryJson() {
    const entity = this.getControlVal('entity') === 'Fastq' ? 'fastqMetadata' : this.getControlVal('entity');
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
    )
      // .then(results => {
      //   this.onNewResults({
      //     results,
      //     entity,
      //     isAdvancedSearch: this.moreSearchOptions,
      //   });
      //   this.queryMap.clearBounds();
      //   this.queryMap.setMarkers(results.data, entity);
      // })
      // .catch(response => {
      //   angular.catcher('Failed to load query results')(response);
      //   this.onNewResults({ results: undefined });
      // })
      // .finally(() => {
      //   this.toggleLoading({ val: false });
      // });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  // Helper Functions
  get form(){ return this.queryForm.controls; };

  getControlVal(control:string){ return this.form[control].value; };

  setControlVal(control:string, val:any){
    this.form[control].setValue(val);
    this.form[control].updateValueAndValidity();
  }
}

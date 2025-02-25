import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAccordionModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../helpers/services/project.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { Subject, take, takeUntil } from 'rxjs';
import { TemplateService } from '../../../../helpers/services/template.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './template.component.html',
  styleUrl: './template.component.scss'
})
export class TemplateComponent implements OnDestroy{
  // Injectors
  projectService = inject(ProjectService);
  templateService = inject(TemplateService);
  authService = inject(AuthenticationService);
  modalService = inject(NgbModal);
  fb = inject(FormBuilder);
  // expeditionService = inject(ExpeditionService);

  // Variablesthis
  private destroy$ = new Subject<void>();
  currentUser: any;
  currentProject: any;
  isLoading: boolean = true;
  worksheets: Array<any> = [];
  allTemplates:Array<any> = [];
  filteredTemplates:Array<any> = [];
  attributes: any;
  projectConfig: any;
  currentStats:any;
  selectedWorksheet:string = '';
  selectedTemplate:string = '';
  selected: any = [];
  attributeArray: Array<any> = [];
  currentEntityErrors:Array<any> = [];
  Object = Object;

  // Modal
  templateForm!: FormGroup;
  modalRef!:NgbModalRef;

  constructor() {
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res: any) => this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
        console.log('====current project=====', res);
        this.currentProject = res;
        this.projectConfig = this.currentProject.config;
        this.getWorksheets();
        this.populateAttributesCache();
        this.getTemplates();
      }
    })
  }

  getWorksheets(){
    this.worksheets = [];
    this.currentProject.config.entities.forEach((e:any) => {
      let name = e.worksheet;
      if (!name || this.worksheets.find(d => d === name)) return;
      this.worksheets.push(name);
    });
    if (this.worksheets.length > 1 && !this.worksheets.includes('Workbook')) {
      this.worksheets.unshift('Workbook');
    }
    this.selectedWorksheet = this.worksheets[0];
    this.filteredTemplates = [ ...this.filterTemplates() ];
    console.log('======get worksheet templates====',this.filteredTemplates);
  }

  getTemplates(){
    this.templateService.getAllTempates(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res){
          this.isLoading = false;
          this.allTemplates = res;
        }
      },
      error: ()=> this.isLoading = false
    })
  }

  filterTemplates(){
    const templates:any = [];
    const filteredData = this.allTemplates.filter((item:any)=> item.worksheet == this.selectedWorksheet);
    filteredData.forEach((item:any)=> templates.push(item.name));
    return templates;
  }

  onTemplateChange(){
    const val = this.selectedTemplate;
    console.log('=====selected val====',val);
    console.log('=====all templates====',this.allTemplates);
    let columnData = [];
    const selectedTemplate = this.allTemplates.find((item:any)=> item.name = val );
    if(!selectedTemplate) return;
    console.log('======selected=temp data====',selectedTemplate);
    this.populateAttributesCache();
    const attributeData = this.currentProject.config.entities.filter((data:any)=> data.worksheet == selectedTemplate.worksheet);
    columnData = attributeData[0].attributes.filter((att:any)=> selectedTemplate.columns.includes(att.column));
    this.selected[selectedTemplate.worksheet] = [ ...columnData ];
    console.log('=======selected data====', this.selected[selectedTemplate.worksheet]);
  }

  populateAttributesCache(){
    this.attributes = this.projectConfig.entities.reduce((accumulator:any, entity:any) => {
      const { worksheet, type } = entity;
    
      if (!worksheet) return accumulator;
    
      this.selected[worksheet] = this.selected[worksheet] || [];
    
      const minInfoStandardItems = this.projectConfig.requiredAttributes(worksheet);
      const attributesByGroup = this.projectConfig.attributesByGroup(worksheet, false);
      const suggestedAttributes = this.projectConfig.suggestedAttributes(worksheet);
    
      accumulator[worksheet] = {
        attributes: {
          'Minimum Information Standard Items': minInfoStandardItems,
          ...attributesByGroup,
        },
      };
    
      this.selected[worksheet].push(...minInfoStandardItems, ...suggestedAttributes);
    
      if (type === 'Photo') {
        accumulator[worksheet].attributes = Object.fromEntries(
          Object.entries(accumulator[worksheet].attributes).map(([group, attributes]:any) => [
            group,
            attributes.filter((attr:any) => !attr.internal),
          ])
        );
      }
    
      return accumulator;
    }, {});
    this.makeAttributeArray();
  }

  makeAttributeArray() {
    this.attributeArray = [];
    Object.keys(this.attributes).forEach(k =>
      this.attributeArray.push({ worksheet: k, data: this.attributes[k] }),
    );
  }

  openDef(entity:any, type:string){
    this.currentStats = { ...entity, entity:type, errors: this.getAttributeErrors(type, entity.column), list: this.getLists(entity.column) };
  }

  inputChange(event:any, entity:any, type:string){
    const checked = event.target.checked;
    const savedIdx = this.selected[type].findIndex((item:any) => item.column == entity.column);
    if(checked && savedIdx == -1)
      this.selected[type].push(entity);
    else if(savedIdx != -1 && !checked)
      this.selected[type] = this.selected[type].slice(0, savedIdx).concat(this.selected['Samples'].slice(savedIdx +1));
  }

  getAttributeErrors(type:string, column:string){
    const currentEntity = this.currentProject.config.entities.filter((item:any)=> item.worksheet == type)[0];
    if(currentEntity)
      return currentEntity.rules.filter((item:any)=> (item.column == column) || item?.columns?.includes(column));
    else return []
  }

  getLists(column:string){
    const filteredList = this.currentProject.config.lists.filter((item:any)=> item.alias == column );
    if(filteredList[0] && filteredList[0].fields) return filteredList[0].fields;
    else return [];
  }

  toggleSelectAll(event:any){
    const isChecked = event.target.checked;
    let allData:any = [];
    if(isChecked){
      this.attributeArray.forEach((item:any)=>{
        const parentGroup = Object.values(item.data.attributes);
        parentGroup.forEach((attributes:any)=> allData[item.worksheet] = [ ...(allData[item.worksheet] || []), ...attributes])
      });
      this.selected = allData;
    }
    else{
      this.selected = [];
      this.populateAttributesCache();
    }
  }

  toggleSelect(event:any, type:string){
    const isChecked = event.target.checked;
    const allData = this.attributeArray.filter((item:any)=> item.worksheet == type)[0];
    if(!allData) return;
    let data:any = [];
    if(isChecked) Object.values(allData.data.attributes).forEach((item:any) => data.push(...item));
    else data = allData.data.attributes['Minimum Information Standard Items'];
    this.selected[type] = [ ...data ];
  }

  onWorksheetChange(event:any){
    const val = event.target.value;
    this.selectedWorksheet = val;
    this.filteredTemplates = [ ...this.filterTemplates() ];
    console.log('=======filtered temp=====',this.filteredTemplates);
    console.log('=======all temp=====',this.allTemplates);
  }

  openSaveModal(content: TemplateRef<any>){
    this.templateForm = this.fb.group({ templateName: ['', Validators.required] });
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  saveTemplate(){
    this.isLoading = true;
    console.log('=======selected vals=====',this.selected[this.selectedWorksheet]);
    const columnNames:any = [];
    const selectedData = this.selected[this.selectedWorksheet];
    if(selectedData && selectedData.length == 0) return;
    selectedData.forEach((item:any)=> columnNames.push(item.column));
    console.log('=====selected column=====', columnNames);

    // Format Data
    const data = new FormData();
    data.append('worksheet', this.form['templateName'].value);
    columnNames.forEach((item:any) => data.append('worksheet', item));

    this.templateService.saveTempates(this.currentProject.projectId, this.templateForm.value, data)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        if(res){
          this.isLoading = false;
        }
      },
      error: (err:any)=> this.isLoading = false
    })
  }

  get form(){ return this.templateForm.controls; }

  get sampleChecks(){ return this.selected['Samples'].map((data:any) => data.column)};
  get eventChecks(){ return this.selected['Events'].map((data:any) => data.column)};
  get tissueChecks(){ return this.selected['Tissues'].map((data:any) => data.column)};
  get eventPhotoChecks(){ return this.selected['event_photos'].map((data:any) => data.column)};
  get samplePhotoChecks(){ return this.selected['sample_photos'].map((data:any) => data.column)};

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

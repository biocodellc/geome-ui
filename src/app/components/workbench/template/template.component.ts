import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAccordionModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../helpers/services/project.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { Subject, catchError, of, switchMap, take, takeUntil } from 'rxjs';
import { TemplateService } from '../../../../helpers/services/template.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileService } from '../../../../helpers/services/file.service';

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
  fileService = inject(FileService);

  // Variables
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
  selected: any = {};
  attributeArray: Array<any> = [];
  currentEntityErrors:Array<any> = [];
  Object = Object;

  // Modal
  templateForm!: FormGroup;
  modalRef!:NgbModalRef;
  templateModalMode: 'save' | 'rename' = 'save';

  constructor() {
    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((res: any) => this.currentUser = res);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res) {
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
    const keepCurrentWorksheet =
      this.selectedWorksheet && this.worksheets.includes(this.selectedWorksheet);
    const defaultWorksheet =
      this.worksheets.find((sheet:string) => sheet !== 'Workbook') || this.worksheets[0] || '';
    this.selectedWorksheet = keepCurrentWorksheet ? this.selectedWorksheet : defaultWorksheet;
    if (this.selectedWorksheet === 'Workbook') this.selectedTemplate = '';
    this.filteredTemplates = [ ...this.filterTemplates() ];
  }

  getTemplates(){
    this.templateService.getAllTempates(this.currentProject.projectId)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.isLoading = false;
        this.allTemplates = this.normalizeTemplates(res);
        this.filteredTemplates = [ ...this.filterTemplates() ];
        if (this.selectedTemplate && !this.filteredTemplates.includes(this.selectedTemplate)) {
          this.selectedTemplate = '';
        }
      },
      error: ()=> this.isLoading = false
    })
  }

  filterTemplates(){
    const names = this.allTemplates
      .filter((item:any)=> item?.worksheet == this.selectedWorksheet)
      .map((item:any) => item?.name)
      .filter((name:any) => !!name);
    return Array.from(new Set(names));
  }

  onTemplateChange(){
    const val = (this.selectedTemplate || '').trim();
    if (!val) {
      this.populateAttributesCache();
      return;
    }
    const selectedTemplate = this.findTemplateByNameAndWorksheet(val, this.selectedWorksheet);
    if(!selectedTemplate){
      this.populateAttributesCache();
      return;
    }
    this.populateAttributesCache();
    const worksheet = selectedTemplate.worksheet || this.selectedWorksheet;
    const attributeData = this.currentProject.config.entities.find((data:any)=> data.worksheet == worksheet);
    if(!attributeData) return;
    const selectedColumns = new Set(this.resolveTemplateColumns(selectedTemplate, worksheet));
    const columnData = attributeData.attributes.filter((att:any)=> selectedColumns.has(att.column));
    const minInfoStandardItems = this.projectConfig.requiredAttributes(worksheet);
    this.selected[worksheet] = this.mergeUniqueByColumn([ ...minInfoStandardItems, ...columnData ]);
  }

  populateAttributesCache(){
    this.selected = {};
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
    
      this.selected[worksheet] = this.mergeUniqueByColumn([
        ...this.selected[worksheet],
        ...minInfoStandardItems,
        ...suggestedAttributes
      ]);
    
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
      this.selected[type] = this.selected[type].slice(0, savedIdx).concat(this.selected[type].slice(savedIdx +1));
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
    let allData:any = {};
    if(isChecked){
      this.attributeArray.forEach((item:any)=>{
        const parentGroup = Object.values(item.data.attributes);
        parentGroup.forEach((attributes:any)=> allData[item.worksheet] = [ ...(allData[item.worksheet] || []), ...attributes])
      });
      this.selected = allData;
    }
    else{
      this.selected = {};
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
    this.selectedTemplate = '';
    this.filteredTemplates = [ ...this.filterTemplates() ];
  }

  openSaveModal(content: TemplateRef<any>){
    this.templateModalMode = 'save';
    this.templateForm = this.fb.group({ templateName: [this.selectedTemplate || '', Validators.required] });
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  openRenameModal(content: TemplateRef<any>){
    if (!this.selectedTemplate) return;
    this.templateModalMode = 'rename';
    this.templateForm = this.fb.group({ templateName: [this.selectedTemplate, Validators.required] });
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  saveTemplate(){
    const templateName = (this.form['templateName'].value || '').trim();
    if(!templateName) return;
    const shouldOverwrite = this.allTemplates.some((t:any) => t?.name === templateName);
    this.persistTemplate(templateName, shouldOverwrite, true);
  }

  updateSelectedTemplate(){
    const templateName = (this.selectedTemplate || '').trim();
    if(!templateName) return;
    this.persistTemplate(templateName, true, false);
  }

  renameTemplate(){
    const oldTemplateName = (this.selectedTemplate || '').trim();
    const newTemplateName = (this.form['templateName'].value || '').trim();
    const selectedData = this.selected[this.selectedWorksheet] || [];
    if (!oldTemplateName || !newTemplateName || selectedData.length === 0) return;
    if (oldTemplateName === newTemplateName) {
      this.modalRef?.close();
      return;
    }

    this.isLoading = true;
    const data = this.buildTemplateFormData(this.selectedWorksheet, selectedData);
    const shouldOverwriteTarget = this.allTemplates.some((t:any) => t?.name === newTemplateName && newTemplateName !== oldTemplateName);

    const saveRenamed$ = () => this.templateService.saveTempates(this.currentProject.projectId, newTemplateName, data);
    const overwriteTarget$ = shouldOverwriteTarget
      ? this.templateService.deleteTempates(this.currentProject.projectId, newTemplateName).pipe(catchError(() => of(null)), switchMap(() => saveRenamed$()))
      : saveRenamed$();

    overwriteTarget$
    .pipe(
      take(1),
      switchMap(() =>
        this.templateService.deleteTempates(this.currentProject.projectId, oldTemplateName).pipe(
          catchError(() => of(null))
        )
      ),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.modalRef?.close();
        this.selectedTemplate = newTemplateName;
        this.getTemplates();
      },
      error: () => this.isLoading = false
    });
  }

  deleteSelectedTemplate(){
    const templateName = (this.selectedTemplate || '').trim();
    if (!templateName) return;
    if (!window.confirm(`Delete template "${templateName}"?`)) return;

    this.isLoading = true;
    this.templateService.deleteTempates(this.currentProject.projectId, templateName)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: ()=>{
        this.isLoading = false;
        this.selectedTemplate = '';
        this.populateAttributesCache();
        this.getTemplates();
      },
      error: ()=> this.isLoading = false
    });
  }

  // Generate File
  generate(){
    this.isLoading = true;
    let payLoad:Array<any> = [];
    for (const worksheet of Object.keys(this.selected)) {
      const data = { worksheet: worksheet, columns: this.selected[worksheet].map((col:any)=> col.column) };
      if(this.selectedWorksheet == 'Workbook')
        payLoad.push(data);
      else if(this.selectedWorksheet == worksheet){
        payLoad.push(data);
        break;
      }
    }
    this.templateService.generateTempate(this.currentProject.projectId, payLoad)
    .pipe(take(1), takeUntil(this.destroy$)).subscribe({
      next: (res:any)=>{
        this.fileService.download(res.url)
        this.isLoading = false
      },
      error: (err:any)=> this.isLoading = false
    })
  }

  get form(){ return this.templateForm.controls; }

  selectedColumns(worksheet: string){
    return (this.selected?.[worksheet] || []).map((data:any) => data.column);
  }

  private mergeUniqueByColumn(attributes:any[]):any[] {
    const columnMap = new Map<string, any>();
    (attributes || []).forEach((attribute:any) => {
      const col = attribute?.column;
      if (!col) return;
      if (!columnMap.has(col)) columnMap.set(col, attribute);
    });
    return Array.from(columnMap.values());
  }

  private normalizeTemplates(response:any):any[] {
    if (Array.isArray(response)) {
      return response
        .map((template:any) => this.normalizeTemplateRecord(template))
        .filter((template:any) => !!template?.name);
    }
    if (Array.isArray(response?.templates)) {
      return response.templates
        .map((template:any) => this.normalizeTemplateRecord(template))
        .filter((template:any) => !!template?.name);
    }
    if (response && typeof response === 'object') {
      return Object.entries(response).map(([name, template]: any) => {
        return this.normalizeTemplateRecord(template, name);
      }).filter((template:any) => !!template?.name);
    }
    return [];
  }

  private normalizeTemplateRecord(template:any, fallbackName:string = ''):any {
    if (!template || typeof template !== 'object') return { name: fallbackName, worksheet: '', columns: [] };
    const worksheet = template?.worksheet || '';
    return {
      ...template,
      name: template?.name || fallbackName,
      worksheet,
      columns: this.resolveTemplateColumns(template, worksheet),
    };
  }

  private findTemplateByNameAndWorksheet(name:string, worksheet:string):any {
    return this.allTemplates.find((item:any)=> item?.name === name && item?.worksheet === worksheet)
      || this.allTemplates.find((item:any)=> item?.name === name);
  }

  private resolveTemplateColumns(template:any, worksheet:string):string[] {
    if (Array.isArray(template?.columns)) {
      return template.columns.map((col:any) => `${col}`.trim()).filter((col:string) => !!col);
    }
    if (typeof template?.columns === 'string') {
      return template.columns.split(',').map((col:string) => col.trim()).filter((col:string) => !!col);
    }

    // Legacy shape: repeated "worksheet" form values where first item is sheet name.
    if (Array.isArray(template?.worksheet)) {
      const values = template.worksheet.map((item:any) => `${item}`.trim()).filter((item:string) => !!item);
      if (!values.length) return [];
      if (worksheet && values[0] === worksheet) return values.slice(1);
      if (this.worksheets.includes(values[0])) return values.slice(1);
      return values;
    }

    return [];
  }

  private buildTemplateFormData(worksheet:string, selectedData:any[]):FormData {
    const data = new FormData();
    data.append('worksheet', worksheet);
    selectedData.forEach((item:any) => {
      const column = item?.column;
      if (!column) return;
      // Canonical payload
      data.append('columns', column);
      // Backward compatibility with older server parsing
      data.append('worksheet', column);
    });
    return data;
  }

  private persistTemplate(templateName:string, overwrite:boolean, closeModal:boolean){
    this.isLoading = true;
    const selectedData = this.selected[this.selectedWorksheet] || [];
    if(!templateName || selectedData.length === 0){
      this.isLoading = false;
      return;
    }

    const data = this.buildTemplateFormData(this.selectedWorksheet, selectedData);
    const save$ = () => this.templateService.saveTempates(this.currentProject.projectId, templateName, data);
    const request$ = overwrite
      ? this.templateService.deleteTempates(this.currentProject.projectId, templateName).pipe(catchError(() => of(null)), switchMap(() => save$()))
      : save$();

    request$
    .pipe(take(1), takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.selectedTemplate = templateName;
        if(closeModal) this.modalRef?.close();
        this.getTemplates();
      },
      error: () => this.isLoading = false
    });
  }

  get sampleChecks(){ return (this.selected['Samples'] || []).map((data:any) => data.column)};
  get eventChecks(){ return (this.selected['Events'] || []).map((data:any) => data.column)};
  get tissueChecks(){ return (this.selected['Tissues'] || []).map((data:any) => data.column)};
  get eventPhotoChecks(){ return (this.selected['event_photos'] || []).map((data:any) => data.column)};
  get samplePhotoChecks(){ return (this.selected['sample_photos'] || []).map((data:any) => data.column)};

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

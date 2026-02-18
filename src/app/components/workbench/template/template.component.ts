import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, TemplateRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAccordionModule, NgbModal, NgbModalRef, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../../../../helpers/services/project.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { Subject, catchError, forkJoin, of, switchMap, take, takeUntil } from 'rxjs';
import { TemplateService } from '../../../../helpers/services/template.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileService } from '../../../../helpers/services/file.service';
import { ToastrService } from 'ngx-toastr';

const WORKBOOK_TEMPLATE_SEPARATOR = '__WB__';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule, NgbAccordionModule, NgbPopoverModule, RouterLink, FormsModule, ReactiveFormsModule],
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
  toastr = inject(ToastrService);

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
    if (!this.worksheets.includes('Workbook')) {
      this.worksheets.unshift('Workbook');
    }
    this.selectedWorksheet = 'Workbook';
    this.filteredTemplates = [ ...this.filterTemplates() ];
    if (this.selectedTemplate && !this.filteredTemplates.includes(this.selectedTemplate)) {
      this.selectedTemplate = '';
    }
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
    if (this.selectedWorksheet === 'Workbook') {
      const names = this.allTemplates
        .map((item:any) => this.toWorkbookDisplayName(item?.name || ''))
        .filter((name:string) => !!name);
      return Array.from(new Set(names));
    }

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
    this.populateAttributesCache();

    if (this.selectedWorksheet === 'Workbook') {
      const templateGroup = this.getWorkbookTemplateGroup(val);
      const entries = templateGroup.flatMap((template:any) => {
        const worksheet = template?.worksheet || this.extractWorksheetFromWorkbookTemplateName(template?.name || '');
        return this.resolveTemplateEntries({ ...template, worksheet }, worksheet || 'Workbook');
      });
      this.applyTemplateEntries(entries);
      return;
    }

    const selectedTemplate = this.findTemplateByNameAndWorksheet(val, this.selectedWorksheet);
    if(!selectedTemplate) return;
    const worksheet = selectedTemplate.worksheet || this.selectedWorksheet;
    const entries = this.resolveTemplateEntries(selectedTemplate, worksheet);
    if (!entries.length) return;

    const attributeData = this.currentProject.config.entities.find((data:any)=> data.worksheet == worksheet);
    if(!attributeData) return;
    const selectedColumns = new Set(entries.map((entry:any) => entry.column));
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

  openSaveModal(content: TemplateRef<any>){
    if (!this.isLoggedIn) {
      this.showLoginRequiredToast('save templates');
      return;
    }
    if (!this.canCreateTemplate) return;
    this.templateModalMode = 'save';
    this.templateForm = this.fb.group({ templateName: [this.selectedTemplate || '', Validators.required] });
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  openCreateModal(content: TemplateRef<any>){
    if (!this.isLoggedIn) {
      this.showLoginRequiredToast('create templates');
      return;
    }
    if (!this.canCreateTemplate) return;
    this.templateModalMode = 'save';
    this.templateForm = this.fb.group({ templateName: ['', Validators.required] });
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  openRenameModal(content: TemplateRef<any>){
    if (!this.isLoggedIn) {
      this.showLoginRequiredToast('rename templates');
      return;
    }
    if (!this.canManageSelectedTemplate) {
      this.showOwnerRequiredToast('rename');
      return;
    }
    this.templateModalMode = 'rename';
    this.templateForm = this.fb.group({ templateName: [this.selectedTemplate, Validators.required] });
    this.modalRef = this.modalService.open(content, { animation: true, centered: true, backdrop: false });
  }

  saveTemplate(){
    if (!this.isLoggedIn) {
      this.showLoginRequiredToast('save templates');
      return;
    }
    if (!this.canCreateTemplate) return;
    const templateName = (this.form['templateName'].value || '').trim();
    if(!templateName) return;
    const shouldOverwrite = this.selectedWorksheet === 'Workbook'
      ? this.getWorkbookTemplateGroup(templateName).length > 0
      : this.allTemplates.some((t:any) => t?.name === templateName);
    if (shouldOverwrite && !this.canManageTemplateName(templateName)) {
      this.showOwnerRequiredToast('overwrite', templateName);
      return;
    }
    this.persistTemplate(templateName, shouldOverwrite, true);
  }

  updateSelectedTemplate(){
    if (!this.isLoggedIn) {
      this.showLoginRequiredToast('save templates');
      return;
    }
    if (!this.canManageSelectedTemplate) {
      this.showOwnerRequiredToast('update');
      return;
    }
    const templateName = (this.selectedTemplate || '').trim();
    if(!templateName) return;
    this.persistTemplate(templateName, true, false);
  }

  renameTemplate(){
    if (!this.isLoggedIn) {
      this.showLoginRequiredToast('rename templates');
      return;
    }
    if (!this.canManageSelectedTemplate) {
      this.showOwnerRequiredToast('rename');
      return;
    }
    const oldTemplateName = (this.selectedTemplate || '').trim();
    const newTemplateName = (this.form['templateName'].value || '').trim();
    const selectedEntries = this.getTemplateSelectionEntries(this.selectedWorksheet);
    if (!oldTemplateName || !newTemplateName || selectedEntries.length === 0) return;
    if (oldTemplateName === newTemplateName) {
      this.modalRef?.close();
      return;
    }

    this.isLoading = true;
    const shouldOverwriteTarget = this.selectedWorksheet === 'Workbook'
      ? this.getWorkbookTemplateGroup(newTemplateName).length > 0 && newTemplateName !== oldTemplateName
      : this.allTemplates.some((t:any) => t?.name === newTemplateName && newTemplateName !== oldTemplateName);
    if (shouldOverwriteTarget && !this.canManageTemplateName(newTemplateName)) {
      this.showOwnerRequiredToast('rename to this name', newTemplateName);
      this.isLoading = false;
      return;
    }

    const saveNew$ = this.saveTemplateSet(newTemplateName, selectedEntries);
    const overwriteTarget$ = shouldOverwriteTarget
      ? this.deleteTemplateSet(newTemplateName).pipe(switchMap(() => saveNew$))
      : saveNew$;

    overwriteTarget$
      .pipe(
        take(1),
        switchMap(() => this.deleteTemplateSet(oldTemplateName)),
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
    if (!this.isLoggedIn) {
      this.showLoginRequiredToast('delete templates');
      return;
    }
    if (!this.canManageSelectedTemplate) {
      this.showOwnerRequiredToast('delete');
      return;
    }
    const templateName = (this.selectedTemplate || '').trim();
    if (!templateName) return;
    if (!window.confirm(`Delete template "${templateName}"?`)) return;

    this.isLoading = true;
    this.deleteTemplateSet(templateName)
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

  get selectedPropertyCount(): number {
    return this.getTemplateSelectionEntries(this.selectedWorksheet).length;
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
      data.append('columns', column);
    });
    return data;
  }

  private persistTemplate(templateName:string, overwrite:boolean, closeModal:boolean){
    this.isLoading = true;
    const selectedEntries = this.getTemplateSelectionEntries(this.selectedWorksheet);
    if(!templateName || selectedEntries.length === 0){
      this.isLoading = false;
      return;
    }

    const save$ = this.saveTemplateSet(templateName, selectedEntries);
    const request$ = overwrite
      ? this.deleteTemplateSet(templateName).pipe(switchMap(() => save$))
      : save$;

    request$
    .pipe(take(1), takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.selectedTemplate = templateName;
        if(closeModal) this.modalRef?.close();
        this.toastr.success('Template saved successfully.');
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

  get canCreateTemplate(): boolean {
    return !!Number(this.currentUser?.userId);
  }

  get isLoggedIn(): boolean {
    return !!Number(this.currentUser?.userId);
  }

  get canManageSelectedTemplate(): boolean {
    const templateName = (this.selectedTemplate || '').trim();
    if (!templateName) return false;
    return this.canManageTemplateName(templateName);
  }

  get selectedTemplateInfoText(): string {
    const details = this.getSelectedTemplateInfoDetails();
    return `Creator: ${details.ownerText}`;
  }

  private getTemplateSelectionEntries(worksheet:string):Array<{ worksheet:string; column:string }>{
    if (worksheet !== 'Workbook') {
      return (this.selected[worksheet] || [])
        .map((item:any) => ({ worksheet, column: item?.column }))
        .filter((entry:any) => !!entry.column);
    }

    const entries:Array<{ worksheet:string; column:string }> = [];
    const worksheetSet = new Set(this.worksheets.filter((sheet:string) => sheet !== 'Workbook'));
    Object.keys(this.selected || {}).forEach((sheet:string) => {
      if (!worksheetSet.has(sheet)) return;
      (this.selected[sheet] || []).forEach((item:any) => {
        const column = item?.column;
        if (!column) return;
        // Backend templates endpoint expects raw column names, not sheet-qualified tokens.
        entries.push({ worksheet: sheet, column });
      });
    });

    const entryMap = new Map<string, { worksheet:string; column:string }>();
    entries.forEach((entry) => entryMap.set(`${entry.worksheet}:${entry.column}`, entry));
    return Array.from(entryMap.values());
  }

  private resolveTemplateEntries(template:any, worksheet:string):Array<{ worksheet:string; column:string }>{
    const columns = this.resolveTemplateColumns(template, worksheet);
    if (!columns.length) return [];

    if (worksheet !== 'Workbook') {
      return columns.map((column:string) => ({ worksheet, column }));
    }

    const parsed:Array<{ worksheet:string; column:string }> = [];
    columns.forEach((token:string) => {
      if (token.includes('::')) {
        const sepIndex = token.indexOf('::');
        const sheet = token.slice(0, sepIndex).trim();
        const column = token.slice(sepIndex + 2).trim();
        if (sheet && column) parsed.push({ worksheet: sheet, column });
      }
      else{
        // Legacy workbook templates with unqualified columns.
        const matchingSheets = this.currentProject?.config?.entities
          ?.filter((e:any) => e?.worksheet && e?.worksheet !== 'Workbook' && e?.attributes?.some((a:any) => a?.column === token))
          ?.map((e:any) => e.worksheet) || [];
        matchingSheets.forEach((sheet:string) => parsed.push({ worksheet: sheet, column: token }));
      }
    });
    return parsed;
  }

  private applyTemplateEntries(entries:Array<{ worksheet:string; column:string }>) {
    if (!entries.length) return;
    const groupedEntries = entries.reduce((acc:any, entry:any) => {
      if (!entry?.worksheet || !entry?.column) return acc;
      acc[entry.worksheet] = [ ...(acc[entry.worksheet] || []), entry.column ];
      return acc;
    }, {});

    Object.keys(groupedEntries).forEach((sheet:string) => {
      const entityConfig = this.currentProject.config.entities.find((data:any)=> data.worksheet == sheet);
      if (!entityConfig) return;
      const selectedColumns = new Set(groupedEntries[sheet] || []);
      const selectedAttributes = entityConfig.attributes.filter((att:any)=> selectedColumns.has(att.column));
      const minInfoStandardItems = this.projectConfig.requiredAttributes(sheet);
      this.selected[sheet] = this.mergeUniqueByColumn([ ...minInfoStandardItems, ...selectedAttributes ]);
    });
  }

  private saveTemplateSet(templateName:string, entries:Array<{ worksheet:string; column:string }>) {
    if (this.selectedWorksheet !== 'Workbook') {
      const data = this.buildTemplateFormData(this.selectedWorksheet, entries);
      return this.templateService.saveTempates(this.currentProject.projectId, templateName, data);
    }

    const groupedEntries = this.groupEntriesByWorksheet(entries);
    const requests = Object.keys(groupedEntries).map((sheet:string) => {
      const data = this.buildTemplateFormData(sheet, groupedEntries[sheet]);
      return this.templateService.saveTempates(
        this.currentProject.projectId,
        this.getWorkbookTemplateStorageName(templateName, sheet),
        data
      );
    });
    if (!requests.length) return of(null);
    return forkJoin(requests);
  }

  private deleteTemplateSet(templateName:string) {
    if (this.selectedWorksheet !== 'Workbook') {
      return this.templateService.deleteTempates(this.currentProject.projectId, templateName).pipe(catchError(() => of(null)));
    }

    const allNames = this.getWorkbookTemplateGroup(templateName).map((t:any) => t?.name).filter((name:string) => !!name);
    const uniqueNames = Array.from(new Set(allNames));
    if (!uniqueNames.length) return of(null);
    return forkJoin(uniqueNames.map((name:string) =>
      this.templateService.deleteTempates(this.currentProject.projectId, name).pipe(catchError(() => of(null)))
    ));
  }

  private groupEntriesByWorksheet(entries:Array<{ worksheet:string; column:string }>) {
    const grouped:any = {};
    entries.forEach((entry:any) => {
      if (!entry?.worksheet || !entry?.column) return;
      grouped[entry.worksheet] = [ ...(grouped[entry.worksheet] || []), { worksheet: entry.worksheet, column: entry.column }];
    });
    return grouped;
  }

  private getWorkbookTemplateStorageName(templateName:string, worksheet:string):string {
    return `${templateName}${WORKBOOK_TEMPLATE_SEPARATOR}${worksheet}`;
  }

  private extractWorksheetFromWorkbookTemplateName(name:string):string {
    const idx = name.lastIndexOf(WORKBOOK_TEMPLATE_SEPARATOR);
    if (idx === -1) return '';
    return name.slice(idx + WORKBOOK_TEMPLATE_SEPARATOR.length);
  }

  private toWorkbookDisplayName(name:string):string {
    const idx = name.lastIndexOf(WORKBOOK_TEMPLATE_SEPARATOR);
    if (idx === -1) return name;
    return name.slice(0, idx);
  }

  private getWorkbookTemplateGroup(templateName:string):any[] {
    return this.allTemplates.filter((template:any) => {
      const name = template?.name || '';
      return name === templateName || this.toWorkbookDisplayName(name) === templateName;
    });
  }

  private canManageTemplateName(templateName:string): boolean {
    const currentUserId = Number(this.currentUser?.userId);
    if (!currentUserId || !templateName) return false;

    const templates = this.getTemplateRecordsByName(templateName);

    if (!templates.length) return false;
    return templates.every((template:any) => this.isTemplateOwnedByCurrentUser(template, currentUserId));
  }

  private isTemplateOwnedByCurrentUser(template:any, currentUserId:number): boolean {
    const ownerId = Number(
      template?.user?.userId ??
      template?.userId ??
      template?.ownerId ??
      template?.createdByUserId ??
      0
    );
    // If owner info is not present in payload, don't block based on unknown ownership.
    if (!ownerId) return true;
    return ownerId === currentUserId;
  }

  private showLoginRequiredToast(action:string): void {
    this.toastr.info(`Please log in to ${action}.`, 'Login Required');
  }

  private showOwnerRequiredToast(action:string, templateNameOverride:string = ''): void {
    const templateName = (templateNameOverride || this.selectedTemplate || '').trim();
    const templates = this.getTemplateRecordsByName(templateName);
    const owners = Array.from(new Set(
      templates
        .map((template:any) => this.getTemplateOwnerDisplay(template))
        .filter((owner:string) => !!owner)
    ));
    const ownerText = owners.length === 1 ? owners[0] : owners.length > 1 ? 'the template owner' : 'the owner';
    this.toastr.warning(`You can ${action} only templates you own. Owner: ${ownerText}.`, 'Permission Required');
  }

  private getTemplateRecordsByName(templateName:string):any[] {
    if (!templateName) return [];
    if (this.selectedWorksheet === 'Workbook') return this.getWorkbookTemplateGroup(templateName);
    return this.allTemplates.filter((template:any) => template?.name === templateName && template?.worksheet === this.selectedWorksheet);
  }

  private getTemplateOwnerDisplay(template:any): string {
    const user = template?.user || {};
    const first = (user?.firstName || user?.firstname || '').toString().trim();
    const last = (user?.lastName || user?.lastname || '').toString().trim();
    const fullName = `${first} ${last}`.trim();
    return fullName || user?.name || user?.username || user?.email || '';
  }

  private getSelectedTemplateInfoDetails(): { ownerText: string } {
    const templateName = (this.selectedTemplate || '').trim();
    if (!templateName) {
      return { ownerText: 'Unknown' };
    }

    const templates = this.getTemplateRecordsByName(templateName);
    if (!templates.length) {
      return { ownerText: 'Unknown' };
    }

    const owners = Array.from(new Set(
      templates
        .map((template:any) => this.getTemplateOwnerDisplay(template))
        .filter((owner:string) => !!owner)
    ));

    return {
      ownerText: owners.length === 1 ? owners[0] : owners.length > 1 ? 'Multiple users' : 'Unknown'
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

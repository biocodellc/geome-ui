import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, QueryList, TemplateRef, ViewChildren } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { ProjectConfigurationService } from '../../../../../helpers/services/project-config.service';
import { firstValueFrom, Subject, take, takeUntil } from 'rxjs';
import { ProjectConfig } from '../../../../../helpers/models/projectConfig.model';
import { DummyDataService } from '../../../../../helpers/services/dummy-data.service';
import { NetworkService } from '../../../../../helpers/services/network.service';
import { SortEvent, SortingDirective } from '../../../../../helpers/directives/sorting.directive';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AVAILABLE_RULES, Rule } from '../../../../../helpers/models/rules.model';
import { AddEditRuleComponent } from '../../../../dialogs/add-edit-rule/add-edit-rule.component';
import { DeleteModalComponent } from '../../../../dialogs/delete-modal/delete-modal.component';
import { cloneDeep } from 'lodash';

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

@Component({
  selector: 'app-entity-details',
  standalone: true,
  imports: [CommonModule, RouterLink, SortingDirective, ReactiveFormsModule],
  templateUrl: './entity-details.component.html',
  styleUrl: './entity-details.component.scss'
})
export class EntityDetailsComponent implements OnDestroy{
  // Injectors
  fb = inject(FormBuilder);
  toastr = inject(ToastrService);
  modalService = inject(NgbModal);
  projectService = inject(ProjectService);
  activatedRoute = inject(ActivatedRoute);
  dummyDataService = inject(DummyDataService);
  networkService = inject(NetworkService);
  projectConfService = inject(ProjectConfigurationService);

  // Variables
  @ViewChildren(SortingDirective) headers!: QueryList<SortingDirective>;
  
  destroy$:Subject<any> = new Subject();
  currentProject:any;
  config!:ProjectConfig;
  networkConfig:any;
  paramData:any;
  entity:any;

  // Modal
  modalRef!: NgbModalRef;

  // Arrtibutes
  attributeForm!:FormGroup;
  selectedAttributes:Array<any> = [];
  requiredUris:Array<any> = [];
  selectedAttributeMap:any = {};
  orderedAttributes:Array<any> = [];
  availableAttributes:any[] = [];

  // Rules
  rulesForm!:FormGroup;
  rules:Array<Rule> = [];
  lists:Array<any> = [];

  constructor(){
    this.dummyDataService.loadingState.next(true);
    this.projectService.currentProject$().pipe(takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res) this.getProjectConfigs(res.projectConfiguration.id);
    })
  }

  getProjectConfigs(id: number) {
    this.projectConfService.getUpdatedCurrentProj().pipe(take(1), takeUntil(this.destroy$)).subscribe(async (res: any) => {
      let project = res ? { ...res } : undefined;
      if (!project) {
        try {
          project = await firstValueFrom(this.projectConfService.get(id));
          this.projectConfService.setInitialProjVal(cloneDeep(project));
        }
        catch (e) { console.warn('========error=====', e); }
      }
      this.currentProject = project;
      this.config = project.config;
      this.extractParams();
    })
  }

  extractParams(){
    this.activatedRoute.params.pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res.entity && res.type){
        this.paramData = { ...res };
        this.entity = this.config.entities.find((item:any) => item.conceptAlias == res.entity);
        if(this.entity) this.getNetworkConfigs();
      }
    })
  }

  getNetworkConfigs(){
    this.networkService.getConfig().pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      this.networkConfig = res
      this.selectedAttributes = [ ...this.entity['attributes'] ];
      if(this.paramData.type === 'attributes'){
        const requiredAtt = this.requiredAttributes();
        this.requiredUris = requiredAtt ? requiredAtt.map((a:any) => a.uri) : [];
        this.availableAttributes = this.getAvailableAttributes();
        this.onAllCheckboxChange(true, false);
        this.updateSelectedAttrbutes();
        this.initAttributeForm();
      }
      else{
        this.rules = [ ...this.entity[this.paramData.type] ];
        this.lists = this.config.lists.map(l => l.alias);
      }
      this.dummyDataService.loadingState.next(false);
    })
  }
  
  // =========================================== ATTRIBUTES ====Start===========================================
  updateSelectedAttrbutes(){
    const filteredAtt = this.availableAttributes.filter(item => !this.selectedAttributes.find(val => val.column === item.column));
    filteredAtt.forEach(item => this.selectedAttributes.push(item));
  }
  
  initAttributeForm(){
    this.attributeForm = this.fb.group({
      group: [''],
      definition: ['']
    })
  }

  setAttControlVal(control:string, val:string){
    this.attributeForm.controls[control].setValue(val);
    this.attributeForm.controls[control].updateValueAndValidity();
  }

  getAvailableAttributes() {
    return this.networkConfig.entities.find((e:any) => e.conceptAlias === this.paramData.entity).attributes;
  }

  requiredAttributes() {
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

    return requiredAttributes;
  }

  orderedIndex(item:any) {
    const i = this.orderedAttributes.indexOf(item.uri);
    return i === -1 ? 'N/A' : i;
  }

  onAllCheckboxChange(event:any, updateConfig:boolean = true){
    const isChecked = event?.target?.checked || event;
    this.selectedAttributes.forEach((item:any)=>{
      this.selectedAttributeMap[item.uri] = isChecked || this.requiredUris.includes(item.uri) ? item : undefined;
      const idx = this.orderedAttributes.findIndex((att:any) => att == item.uri);
      if(!isChecked && idx && !this.requiredUris.includes(item.uri))
        this.orderedAttributes = this.orderedAttributes.slice(0, idx).concat( this.orderedAttributes.slice(idx + 1) )
      else if(isChecked && !this.requiredUris.includes(item.uri))
        this.orderedAttributes.push(item.uri);
    })
    this.updateOrderedArr(updateConfig);
  }

  updateOrderedArr(updateConfig:boolean = true){
    let checkedAtt:any[] = [];
    Object.keys(this.selectedAttributeMap).forEach((key:string) =>{
      if(this.selectedAttributeMap[key]) checkedAtt.push(key);
    })
    this.orderedAttributes = checkedAtt;
    if(updateConfig) this.updateConfig();
  }

  get selectedAttUris(){ return Object.values(this.selectedAttributeMap).map((att:any) => att?.uri).filter((att:any) => att); }
  
  get orderIdxArr(){ return this.orderedAttributes };

  onSelectChange(event:any, attribute:any){
    if(this.requiredUris.includes(attribute.uri)) return;
    const isChecked = event.target.checked;
    this.selectedAttributeMap[attribute.uri] = isChecked ? attribute : undefined;
    this.updateOrderedArr();
  }

  onSort({ column, direction }: SortEvent | any) {
		// resetting other headers
		for (const header of this.headers) {
			if (header.sortable !== column) header.direction = '';
		}

		// sorting countries
		if ((direction === '' || column === '') && column == 'order') {
			this.selectedAttributes = [ ...this.entity[this.paramData.type] ];
    }
		if ((direction === '' || column === '') && column == 'level') {
      this.rules = [ ...this.entity[this.paramData.type] ];
		} else if(column == 'order'){
			this.selectedAttributes = [...this.selectedAttributes].sort((a, b) => {
				const res = compare(this.orderIdxArr.indexOf(a.uri), this.orderIdxArr.indexOf(b.uri));
				return direction === 'asc' ? res : -res;
			});
		}
    else if(column == 'level'){
      this.rules = [...this.rules].sort((a, b) => {
				const res = compare(a.level.toLowerCase(), b.level.toLowerCase());
				return direction === 'asc' ? res : -res;
			});
    }
	}

  async updateConfig(){
    const projectData = { ...this.currentProject };
    const entityIdx = projectData.config.entities.findIndex((item:any) => item.conceptAlias == this.entity.conceptAlias);
    if(this.paramData.type == 'rules'){
      const rules = this.rules.map((rule:Rule) =>{
        delete rule.requiredItems;
        return rule;
      })
      projectData.config.entities[entityIdx].rules = [ ...rules ];
    }
    else if(this.paramData.type == 'attributes'){
      const updatedAttributes = this.orderedAttributes.map(uri => this.selectedAttributeMap[uri]);
      projectData.config.entities[entityIdx].attributes = updatedAttributes;
    }
    setTimeout(() => {
      this.projectConfService.updateCurrentProj(projectData);
    }, 100);
  }

  saveConfigs(){
    this.dummyDataService.loadingState.next(true);
    const projectData = { ...this.currentProject };
    const entityIdx = projectData.config.entities.findIndex((item:any) => item.conceptAlias == this.entity.conceptAlias);
    if(this.paramData.type == 'rules'){
      const rules = this.rules.map((rule:Rule) =>{
        delete rule.requiredItems;
        return rule;
      })
      projectData.config.entities[entityIdx].rules = [ ...rules ];
    }
    else if(this.paramData.type == 'attributes'){
      const updatedAttributes = this.orderedAttributes.map(uri => this.selectedAttributeMap[uri]);
      projectData.config.entities[entityIdx].attributes = updatedAttributes;
    }
    this.projectConfService.save(projectData).pipe(take(1), takeUntil(this.destroy$)).subscribe(()=>{
      this.toastr.success('Configs Updated!');
      this.dummyDataService.loadingState.next(false);
    })
  }

  // =========================================== ATTRIBUTES ====Ends===========================================

  // Modal
  openModal(content:TemplateRef<any> | string, data?: any | Rule, idx?:number) {
    if(this.paramData.type == 'attributes')
      ['group', 'definition'].forEach((key:string) => this.setAttControlVal(key, data[key] || ''));

    this.modalRef = this.modalService.open(
      content == 'rule' ? AddEditRuleComponent : content,
      { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false }
    );

    if(content == 'rule') this.modalRef.componentInstance.modalData = {
      rule: data ? Object.assign({}, data) : null,
      ruleIdx: idx,
      availableRules: [ ...AVAILABLE_RULES ],
      columns: this.selectedAttributes.map(att => att.column).filter(att => att),
      lists: this.lists,
    }

    this.modalRef.dismissed.pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res == 'save' && this.paramData.type == 'attributes'){
        const updatedData = { ...data, ...this.attributeForm.value };
        this.selectedAttributeMap[data.uri] = updatedData;
        // Updating value in attributes of entity
        const idx = this.entity.attributes.findIndex((att:any) => att.uri == data.uri);
        this.entity.attributes[idx] = updatedData;
        // Updating value in attributes of selectedAttributes
        const idx_2 = this.selectedAttributes.findIndex((att:any) => att.uri == data.uri );
        this.selectedAttributes[idx_2] = updatedData;

        this.updateConfig();
      }
      else if(res?.idx >= 0 && this.paramData.type == 'rules'){
        this.rules[res.idx] = res.rule;
        this.updateConfig()
      }
      else if(!res?.idx && this.paramData.type == 'rules'){
        this.rules.push(res.rule);
        this.updateConfig();
      }
    })
  }

  openDeleteModal(rule:Rule){
    this.modalRef = this.modalService.open(
      DeleteModalComponent,
      { animation: true, centered: true, windowClass: 'no-backdrop', backdrop: false }
    );
    this.modalRef.componentInstance.modalFor = 'Rule';
    this.modalRef.dismissed.pipe(take(1), takeUntil(this.destroy$)).subscribe((res:any)=>{
      if(res){
        const idx = this.rules.findIndex((r:Rule) => r.name == rule.name);
        this.rules = this.rules.slice(0, idx).concat( this.rules.slice(idx + 1) );
        this.updateConfig();
      }
    })
  }

  joinMetaData(data:any){
    if(Array.isArray(data)) return data.join(', ');
    else return data;
  }

  get configChanges():boolean{
    if(!this.paramData?.type) return false;
    const newData = this.paramData.type == 'attributes' ? this.selectedAttributes : this.rules;
    return JSON.stringify(this.entity[this.paramData.type]) !== JSON.stringify(newData);
  }

  isObjectEmpty(data:{}){
    return Object.values(data).filter(item => item).length > 0 ? false : true;
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}

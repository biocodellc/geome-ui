import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ProjectConfig } from '../../../../helpers/models/projectConfig.model';
import { CommonModule } from '@angular/common';
import { QueryParams } from '../../../../helpers/scripts/queryParam';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

const queryTypes:any = {
  string: ['=', 'like', 'has'],
  float: ['=', '<', '<=', '>', '>=', 'has'],
  datetime: ['=', '<', '<=', '>', '>=', 'has'],
  date: ['=', '<', '<=', '>', '>=', 'has'],
  integer: ['=', '<', '<=', '>', '>=', 'has'],
  list: ['=', 'has'],
};

const booleanValues:Array<any> = [{ value: 'true' }, { value: 'false' }];

@Component({
  selector: 'app-filter-button',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPopoverModule],
  templateUrl: './filter-button.component.html',
  styleUrl: './filter-button.component.scss'
})
export class FilterButtonComponent implements OnChanges{
  // Decorators
  @Input() conceptAlias:string = '';
  @Input() currentConfig!:ProjectConfig;
  @Input() params!:QueryParams;
  
  // Injectors

  // Variables
  filterOptions:Array<any> = [];
  queryTypes:Array<any> = [];
  filter:Array<any> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['currentConfig'] && JSON.stringify(changes['currentConfig'].previousValue) != JSON.stringify(this.currentConfig)){
      this.currentConfig = changes['currentConfig'].currentValue;
      this.setOptionValues();
    }
  }

  setOptionValues(){
    const aliasData = this.currentConfig.entities.filter(item => item.conceptAlias == this.conceptAlias);
    if(!aliasData.length) return;
    aliasData.forEach(e => {
      const alias = e.conceptAlias;
      let opts = e.attributes
        .filter((a:any) => !a.internal)
        .map((a:any) => ({
          column: `${alias}.${a.column}`,
          dataType: a.dataType,
          list: this.currentConfig.findListForColumn(e, a.column)
        }));
      opts = opts.map((item:any)=> ({ ...item, queryTypes: this.getQueryTypes(item), newList: this.getList(item) }))
      this.filterOptions = opts;
      this.filterOptions.sort((a:any, b:any) =>
        a.column > b.column ? 1 : b.column > a.column ? -1 : 0,
      );
    });
  }

  setIdAsDefaultFilter() {
    const filter:any = { type: '=', value: '', $$hashKey: this.getUniqueHashId() };
    if (this.conceptAlias === 'Event') {
      filter.column = 'Event.eventID';
      this.filter.push(filter);
    } else if (this.conceptAlias === 'Sample') {
      filter.column = 'Sample.materialSampleID';
      this.filter.push(filter);
    } else if (this.conceptAlias === 'Tissue') {
      filter.column = 'Tissue.tissueID';
      this.filter.push(filter);
    } else if (this.conceptAlias === 'Sample_Photo') {
      filter.column = 'Sample_Photo.photoID';
      this.filter.push(filter);
    } else if (this.conceptAlias === 'Event_Photo') {
      filter.column = 'Event_Photo.photoID';
      this.filter.push(filter);
    }
    this.filterToggle(filter);
  }

  getColumnIdx(chip:any):number{
    return this.params.filters.findIndex((e:any) => e.column === chip.column && e.$$hashKey == chip.$$hashKey);
  }

  onTypeChange(chip:any){
    const idx = this.getColumnIdx(chip);
    if(this.params.filters[idx].type == 'has'){
      this.params.filters[idx].value = '';
    }
  }

  removeFilter(chip:any){
    const idx = this.filter.findIndex((item:any) => item.column == chip.column && item.$$hashKey == chip.$$hashKey);
    this.filter = this.filter.slice(0, idx).concat(this.filter.slice(idx + 1));
    this.filterToggle(chip, true);
  }

  filterToggle(chip:any, removal:boolean = false) {
    if (!removal) {
      this.params.filters.push(chip);
    } else if (removal) {
      const index = this.params.filters.findIndex((item:any) => item.column == chip.column && item.$$hashKey == chip.$$hashKey);
      this.params.filters = this.params.filters.slice(0, index).concat(this.params.filters.slice(index + 1));
    }
  }

  getFilterOptions(column:string){ return this.filterOptions.find((item:any) => item.column == column) };

  getQueryTypes(opt:any) {
    if (opt) {
      if (opt.list || opt.dataType === 'BOOLEAN') {
        return queryTypes.list;
      }
      return queryTypes[opt.dataType.toLowerCase()];
    }
    return [];
  }

  getList(opt:any) {
    if (opt.dataType === 'BOOLEAN') {
      return booleanValues;
    } else if (opt.list) {
      return opt.list.fields;
    }
    return [];
  }

  getUniqueHashId(){ return `${this.conceptAlias}_` +(Math.random() * 100).toFixed(0) };
}

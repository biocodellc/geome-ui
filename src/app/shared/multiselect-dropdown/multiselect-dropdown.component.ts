import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-multiselect-dropdown',
  standalone: true,
  imports: [CommonModule, NgMultiSelectDropDownModule, FormsModule, ReactiveFormsModule],
  templateUrl: './multiselect-dropdown.component.html',
  styleUrl: './multiselect-dropdown.component.scss'
})
export class MultiselectDropdownComponent implements OnChanges{
  fb = inject(FormBuilder)
  @ViewChild('multiSelect') multiSelectRef:any;
  @Output() valueChange:EventEmitter<any> = new EventEmitter();
  @Input() dropDownData:any;
  @Input() value:any;
  @Input() formType:string = '';
  @Input() formGroup:FormGroup = this.fb.group({});
  
  // setting and support i18n
  data:any[] = [];
  settings = {
    singleSelection: false,
    enableCheckAll: true,
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    allowSearchFilter: true,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 10,
    searchPlaceholderText: 'Search Here',
    noDataAvailablePlaceholderText: 'No Data Available',
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['dropDownData'] && changes['dropDownData'].currentValue){
      this.data = [ ...changes['dropDownData'].currentValue ];
    }
  }

  onItemSelect(item:any){ setTimeout(() => this.valueChange.emit({ item, value: this.value }), 100 )};
  onItemDeSelect(item:any){ setTimeout(() => this.valueChange.emit({ item, value: this.value, isDeSelected: true }), 100 )};
  onSelectAll(item:any){ setTimeout(() => this.valueChange.emit({ item, value: this.value }), 100 )};
  onDeSelectAll(item:any){ setTimeout(() => this.valueChange.emit({ item, value: this.value, isDeSelected: true }), 100 )};

  getFormControl(control:string){ return this.formGroup.get(control) as FormControl; }
}

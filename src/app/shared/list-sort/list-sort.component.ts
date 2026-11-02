import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT, saveSortPreference, SortPreference, sortOptions } from '../../../helpers/scripts/list-sorting';

@Component({
  selector: 'app-list-sort', standalone: true, imports: [FormsModule],
  styles: [':host { display: block; } select { max-width: 100%; }'],
  template: `
    <div class="d-flex flex-wrap align-items-center gap-2 my-3">
      <label [for]="preferenceKey + '-sort'">Sort by</label>
      <select class="form-select w-auto" [id]="preferenceKey + '-sort'" [ngModel]="preference.field" (ngModelChange)="changeField($event)">
        @for(option of options; track option.field){ <option [value]="option.field" [disabled]="option.disabled">{{option.label}}</option> }
      </select>
      <label class="visually-hidden" [for]="preferenceKey + '-direction'">Sort direction</label>
      <select class="form-select w-auto" [id]="preferenceKey + '-direction'" [ngModel]="preference.direction" (ngModelChange)="changeDirection($event)">
        <option value="asc">Ascending</option><option value="desc">Descending</option>
      </select>
    </div>
    @if(items.length && unavailable){ <p class="small text-secondary" role="status">The selected sort is unavailable. Showing alphabetical order until its information is available.</p> }
  `
})
export class ListSortComponent {
  @Input() items: readonly any[] = [];
  @Input() preferenceKey = 'expeditions';
  @Input() preference: SortPreference = { ...DEFAULT_SORT };
  @Output() preferenceChange = new EventEmitter<SortPreference>();
  get options() { return sortOptions(this.items); }
  get unavailable(): boolean { return !this.options.some(option => option.field === this.preference.field && !option.disabled); }
  changeField(field: string): void {
    this.set({ field, direction: field === 'title' || ['ownerLastName', 'ownerFirstName', 'ownerUsername'].includes(field) ? 'asc' : 'desc' });
  }
  changeDirection(direction: 'asc' | 'desc'): void { this.set({ ...this.preference, direction }); }
  private set(preference: SortPreference): void {
    saveSortPreference(this.preferenceKey, preference);
    this.preferenceChange.emit(preference);
  }
}

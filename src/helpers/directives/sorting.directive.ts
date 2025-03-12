import { Directive, EventEmitter, Input, Output } from '@angular/core';

export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = { asc: 'desc', desc: '', '': 'asc' };

export interface SortEvent {
	column: string;
	direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
	standalone: true,
	host: {
		'[class.asc]': 'direction === "asc"',
		'[class.desc]': 'direction === "desc"',
		'(click)': 'rotate()',
	},
})

export class SortingDirective {
  @Input() sortable: string = '';
	@Input() direction: SortDirection = '';
	@Output() sort = new EventEmitter<SortEvent>();

	rotate() {
    this.direction = rotate[this.direction] == '' ? 'asc' : rotate[this.direction];
    console.log(this.direction, this.sortable);
		this.sort.emit({ column: this.sortable, direction: this.direction });
	}

}

import { Component, Input } from '@angular/core';
import { activityEpoch } from '../../../helpers/scripts/list-sorting';

@Component({
  selector: 'app-latest-activity', standalone: true,
  template: `<span class="d-block small text-secondary mt-1">
    Latest Activity: @if(epoch !== null){<time [attr.datetime]="iso">{{formatted}}</time>@if(showUser){<span [class.d-block]="userOnNewLine">{{userOnNewLine ? '' : '; '}}User: {{username || 'Unknown'}}</span>}} @else {No data activity}
  </span>`
})
export class LatestActivityComponent {
  @Input() timestamp: unknown;
  @Input() username: string | null | undefined;
  @Input() userOnNewLine = false;
  @Input() showUser = true;
  private formatter = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
  get epoch(): number | null { return activityEpoch(this.timestamp); }
  get iso(): string { return this.epoch === null ? '' : new Date(this.epoch).toISOString(); }
  get formatted(): string { return this.epoch === null ? '' : this.formatter.format(this.epoch); }
}

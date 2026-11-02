import { TestBed } from '@angular/core/testing';
import { LatestActivityComponent } from './latest-activity.component';
describe('LatestActivityComponent', () => {
  it('shows local date, time to seconds, timezone and the real actor', () => {
    const fixture = TestBed.createComponent(LatestActivityComponent);
    fixture.componentInstance.timestamp = '2024-01-01T12:34:56Z';
    fixture.componentInstance.username = 'editor';
    fixture.detectChanges();
    const formatter = new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
    expect(fixture.nativeElement.textContent).toContain(formatter.format(new Date('2024-01-01T12:34:56Z')));
    expect(fixture.nativeElement.textContent).toContain('User: editor');
    expect(fixture.nativeElement.querySelector('time').dateTime).toBe('2024-01-01T12:34:56.000Z');
  });
  it('never substitutes the owner for missing attribution', () => {
    const fixture = TestBed.createComponent(LatestActivityComponent);
    fixture.componentInstance.timestamp = '2024-01-01Z';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unknown');
  });
  it('shows no activity when no timestamp exists', () => {
    const fixture = TestBed.createComponent(LatestActivityComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No data activity');
    expect(fixture.nativeElement.querySelector('time')).toBeNull();
  });
});

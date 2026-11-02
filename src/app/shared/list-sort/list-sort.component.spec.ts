import { TestBed } from '@angular/core/testing';
import { ListSortComponent } from './list-sort.component';
import { readSortPreference } from '../../../helpers/scripts/list-sorting';
describe('ListSortComponent', () => {
  afterEach(() => localStorage.removeItem('geome.sort.v1.test'));
  it('chooses sensible directions and persists explicitly chosen sorting', () => {
    const fixture = TestBed.createComponent(ListSortComponent);
    const component = fixture.componentInstance;
    component.preferenceKey = 'test';
    const change = spyOn(component.preferenceChange, 'emit');
    component.changeField('ownerLastName');
    expect(change).toHaveBeenCalledWith({ field: 'ownerLastName', direction: 'asc' });
    component.changeField('ownerFirstName');
    expect(change).toHaveBeenCalledWith({ field: 'ownerFirstName', direction: 'asc' });
    component.changeField('ownerUsername');
    expect(change).toHaveBeenCalledWith({ field: 'ownerUsername', direction: 'asc' });
    component.changeField('SampleCount');
    expect(readSortPreference('test')).toEqual({ field: 'SampleCount', direction: 'desc' });
  });
  it('explains missing statistics without replacing the saved preference', () => {
    const fixture = TestBed.createComponent(ListSortComponent);
    fixture.componentInstance.items = [{ expeditionTitle: 'A' }];
    fixture.componentInstance.preference = { field: 'SampleCount', direction: 'desc' };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Showing alphabetical order');
  });
});

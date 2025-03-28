import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceDataDialogComponent } from './replace-data-dialog.component';

describe('ReplaceDataDialogComponent', () => {
  let component: ReplaceDataDialogComponent;
  let fixture: ComponentFixture<ReplaceDataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplaceDataDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplaceDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

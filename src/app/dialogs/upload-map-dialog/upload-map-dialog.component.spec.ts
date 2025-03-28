import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMapDialogComponent } from './upload-map-dialog.component';

describe('UploadMapDialogComponent', () => {
  let component: UploadMapDialogComponent;
  let fixture: ComponentFixture<UploadMapDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadMapDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadMapDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

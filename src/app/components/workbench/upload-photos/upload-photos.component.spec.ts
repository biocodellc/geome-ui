import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadPhotosComponent } from './upload-photos.component';

describe('UploadPhotosComponent', () => {
  let component: UploadPhotosComponent;
  let fixture: ComponentFixture<UploadPhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadPhotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

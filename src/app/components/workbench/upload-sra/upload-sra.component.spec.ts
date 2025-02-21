import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSraComponent } from './upload-sra.component';

describe('UploadSraComponent', () => {
  let component: UploadSraComponent;
  let fixture: ComponentFixture<UploadSraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadSraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadSraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

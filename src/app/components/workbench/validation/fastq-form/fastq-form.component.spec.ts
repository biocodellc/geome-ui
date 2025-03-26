import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastqFormComponent } from './fastq-form.component';

describe('FastqFormComponent', () => {
  let component: FastqFormComponent;
  let fixture: ComponentFixture<FastqFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FastqFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FastqFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

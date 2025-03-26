import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastaFormComponent } from './fasta-form.component';

describe('FastaFormComponent', () => {
  let component: FastaFormComponent;
  let fixture: ComponentFixture<FastaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FastaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FastaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

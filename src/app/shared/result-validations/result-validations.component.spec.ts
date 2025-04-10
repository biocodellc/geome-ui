import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultValidationsComponent } from './result-validations.component';

describe('ResultValidationsComponent', () => {
  let component: ResultValidationsComponent;
  let fixture: ComponentFixture<ResultValidationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultValidationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultValidationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

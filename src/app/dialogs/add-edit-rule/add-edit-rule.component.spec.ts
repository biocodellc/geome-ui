import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditRuleComponent } from './add-edit-rule.component';

describe('AddEditRuleComponent', () => {
  let component: AddEditRuleComponent;
  let fixture: ComponentFixture<AddEditRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditRuleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

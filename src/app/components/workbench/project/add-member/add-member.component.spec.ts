import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMemberComponent } from './add-member.component';

describe('AddMemberComponent', () => {
  let component: AddMemberComponent;
  let fixture: ComponentFixture<AddMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

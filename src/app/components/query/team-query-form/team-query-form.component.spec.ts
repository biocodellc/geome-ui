import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamQueryFormComponent } from './team-query-form.component';

describe('TeamQueryFormComponent', () => {
  let component: TeamQueryFormComponent;
  let fixture: ComponentFixture<TeamQueryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamQueryFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamQueryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

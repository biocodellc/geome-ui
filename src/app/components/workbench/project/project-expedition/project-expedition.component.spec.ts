import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectExpeditionComponent } from './project-expedition.component';

describe('ProjectExpeditionComponent', () => {
  let component: ProjectExpeditionComponent;
  let fixture: ComponentFixture<ProjectExpeditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectExpeditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectExpeditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

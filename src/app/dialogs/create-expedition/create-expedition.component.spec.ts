import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExpeditionComponent } from './create-expedition.component';

describe('CreateExpeditionComponent', () => {
  let component: CreateExpeditionComponent;
  let fixture: ComponentFixture<CreateExpeditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateExpeditionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateExpeditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

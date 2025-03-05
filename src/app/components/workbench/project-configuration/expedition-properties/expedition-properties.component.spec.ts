import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpeditionPropertiesComponent } from './expedition-properties.component';

describe('ExpeditionPropertiesComponent', () => {
  let component: ExpeditionPropertiesComponent;
  let fixture: ComponentFixture<ExpeditionPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpeditionPropertiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpeditionPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

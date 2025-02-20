import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpeditionsSettingComponent } from './expeditions-setting.component';

describe('ExpeditionsSettingComponent', () => {
  let component: ExpeditionsSettingComponent;
  let fixture: ComponentFixture<ExpeditionsSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpeditionsSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpeditionsSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

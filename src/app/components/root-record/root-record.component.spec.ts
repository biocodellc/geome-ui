import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RootRecordComponent } from './root-record.component';

describe('RootRecordComponent', () => {
  let component: RootRecordComponent;
  let fixture: ComponentFixture<RootRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RootRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RootRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

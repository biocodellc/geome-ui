import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeLabelComponent } from './notice-label.component';

describe('NoticeLabelComponent', () => {
  let component: NoticeLabelComponent;
  let fixture: ComponentFixture<NoticeLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticeLabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticeLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

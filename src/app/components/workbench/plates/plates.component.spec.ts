import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatesComponent } from './plates.component';

describe('PlatesComponent', () => {
  let component: PlatesComponent;
  let fixture: ComponentFixture<PlatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapBoundingComponent } from './map-bounding.component';

describe('MapBoundingComponent', () => {
  let component: MapBoundingComponent;
  let fixture: ComponentFixture<MapBoundingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapBoundingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapBoundingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

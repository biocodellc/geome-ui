import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryPhotosComponent } from './query-photos.component';

describe('QueryPhotosComponent', () => {
  let component: QueryPhotosComponent;
  let fixture: ComponentFixture<QueryPhotosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueryPhotosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { MapQueryService } from '../map-query.service';

describe('MapQueryService', () => {
  let service: MapQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { RouteTrackerService } from '../route-track.service';

describe('RouteTrackService', () => {
  let service: RouteTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

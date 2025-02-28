import { TestBed } from '@angular/core/testing';

import { PlatesService } from './plates.service';

describe('PlatesService', () => {
  let service: PlatesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

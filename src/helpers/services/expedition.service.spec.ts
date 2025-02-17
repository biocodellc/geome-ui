import { TestBed } from '@angular/core/testing';

import { ExpeditionService } from './expedition.service';

describe('ExpeditionService', () => {
  let service: ExpeditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpeditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

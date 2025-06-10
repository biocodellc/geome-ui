import { TestBed } from '@angular/core/testing';

import { SraService } from './sra.service';

describe('SraService', () => {
  let service: SraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

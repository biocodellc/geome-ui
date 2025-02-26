import { TestBed } from '@angular/core/testing';

import { ExcelParserService } from './excel-parser.service';

describe('ExcelParserService', () => {
  let service: ExcelParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { ProjectConfigurationService } from '../project-config.service';

describe('ProjectConfigService', () => {
  let service: ProjectConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

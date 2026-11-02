import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ProjectService } from './project.service';
import { AuthenticationService } from './authentication.service';
import { ProjectConfigurationService } from './project-config.service';

describe('Authenticated project request sharing', () => {
  let service: ProjectService;
  let http: HttpTestingController;
  let token: string;
  let users: BehaviorSubject<any>;
  const match = (req: any) => req.url.endsWith('/projects') && req.params.get('includePublic') === 'false';
  beforeEach(() => {
    token = 'first-session';
    users = new BehaviorSubject<any>({ userId: 7 });
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
      { provide: AuthenticationService, useValue: { currentUser: users, getUserFromStorage: () => ({ accessToken: token }) } },
      { provide: ProjectConfigurationService, useValue: {} }
    ] });
    service = TestBed.inject(ProjectService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('shares the startup request with membership checks and later navigation', () => {
    let received = 0;
    service.getAllProjects(false).subscribe(() => received++);
    service.getAuthenticatedProjects().subscribe(() => received++);
    const request = http.expectOne(match);
    expect(request.request.params.get('present')).toBe('false');
    request.flush([{ projectId: 1 }]);
    service.getAuthenticatedProjects().subscribe(() => received++);
    http.expectNone(match);
    expect(received).toBe(3);
  });

  it('refreshes after one minute', fakeAsync(() => {
    service.getAuthenticatedProjects().subscribe();
    http.expectOne(match).flush([]);
    tick(60_001);
    service.getAuthenticatedProjects().subscribe();
    const request = http.expectOne(match);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  }));

  it('does not reuse another session’s membership response', () => {
    service.getAuthenticatedProjects().subscribe();
    http.expectOne(match).flush([{ projectId: 1 }]);
    token = 'second-session';
    service.getAuthenticatedProjects().subscribe();
    const request = http.expectOne(match);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('does not cache failures and permits an explicit refresh', () => {
    service.getAuthenticatedProjects().subscribe({ error: () => {} });
    http.expectOne(match).flush({}, { status: 403, statusText: 'Forbidden' });
    service.getAuthenticatedProjects().subscribe();
    http.expectOne(match).flush([]);
    service.clearAuthenticatedProjectsCache();
    service.getAuthenticatedProjects().subscribe();
    const request = http.expectOne(match);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });
});

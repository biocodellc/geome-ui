import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ExpeditionService } from './expedition.service';
import { accessFor, owner } from '../testing/project-access.fixture';

describe('Expedition endpoint selection', () => {
  let service: ExpeditionService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ExpeditionService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses the member endpoint without an admin flag', () => {
    service.getAccessibleExpeditions(accessFor()).subscribe();
    const request = http.expectOne(req => req.url.includes('/expeditions?user&includePrivate=true'));
    expect(request.request.url).not.toContain('?admin');
    request.flush([]);
  });

  it('reserves the admin endpoint for the project owner', () => {
    service.getAccessibleExpeditions(accessFor(owner)).subscribe();
    const request = http.expectOne(req => req.url.includes('/expeditions?admin&includePrivate=true'));
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('does not issue member requests for public visitors or unresolved membership', () => {
    const rejected = jasmine.createSpy('rejected');
    service.getAccessibleExpeditions({ ...accessFor(), isMember: false }).subscribe({ error: rejected });
    service.getAccessibleExpeditions({ ...accessFor(), loading: true }).subscribe({ error: rejected });
    http.expectNone(req => req.url.includes('/expeditions'));
    expect(rejected).toHaveBeenCalledTimes(2);
  });

  it('reuses the list request when opening expedition details with the same verified context', () => {
    const access = accessFor();
    let received = 0;
    service.getAccessibleExpeditions(access).subscribe(() => received++);
    service.getAccessibleExpeditions(access).subscribe(() => received++);
    http.expectOne(req => req.url.includes('/expeditions?user')).flush([]);
    service.getAccessibleExpeditions(access).subscribe(() => received++);
    http.expectNone(req => req.url.includes('/expeditions'));
    expect(received).toBe(3);
  });

  it('refreshes the list after 30 seconds', fakeAsync(() => {
    const access = accessFor();
    service.getAccessibleExpeditions(access).subscribe();
    http.expectOne(req => req.url.includes('/expeditions?user')).flush([]);
    tick(30_001);
    service.getAccessibleExpeditions(access).subscribe();
    const request = http.expectOne(req => req.url.includes('/expeditions?user'));
    expect(request.request.method).toBe('GET');
    request.flush([]);
  }));

  it('refreshes after saving and keeps account contexts separate', () => {
    const access = accessFor();
    service.getAccessibleExpeditions(access).subscribe();
    http.expectOne(req => req.url.includes('/expeditions?user')).flush([]);
    service.updateExpedition(1, { expeditionCode: 'TEST' }).subscribe();
    http.expectOne(req => req.method === 'PUT').flush({ expeditionCode: 'TEST' });
    service.getAccessibleExpeditions(access).subscribe();
    http.expectOne(req => req.url.includes('/expeditions?user')).flush([]);
    service.getAccessibleExpeditions(accessFor(owner)).subscribe();
    const request = http.expectOne(req => req.url.includes('/expeditions?admin'));
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });
});

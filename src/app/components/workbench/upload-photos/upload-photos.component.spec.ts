import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subject, throwError } from 'rxjs';
import { UploadPhotosComponent } from './upload-photos.component';
import { ProjectAccessService } from '../../../../helpers/services/project-access.service';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { PhotoService } from '../../../../helpers/services/photo.service';
import { accessFor, member, memberProject, owner, ProjectAccessStub } from '../../../../helpers/testing/project-access.fixture';

const entities = (uniqueAcrossProject = false) => [
  { conceptAlias: 'Sample', uniqueKey: 'materialSampleID', uniqueAcrossProject },
  { conceptAlias: 'Sample_Photo', type: 'Photo', parentEntity: 'Sample', attributes: [] }
];
const project = (enforceExpeditionAccess = false, uniqueAcrossProject = false) => ({
  ...memberProject, public: false, enforceExpeditionAccess, config: { entities: entities(uniqueAcrossProject) }
});
const memberOnly = (code: string, user: any = owner) => ({
  expeditionId: code, expeditionCode: code, expeditionTitle: 'Duplicate title', user, visibility: 'project members', public: false
});

describe('UploadPhotosComponent upload access', () => {
  let fixture: ComponentFixture<UploadPhotosComponent>;
  let component: UploadPhotosComponent;
  let access: ProjectAccessStub;
  let expeditions: jasmine.SpyObj<ExpeditionService>;
  let photos: jasmine.SpyObj<PhotoService>;
  let projects: jasmine.SpyObj<ProjectService>;
  let auth: jasmine.SpyObj<AuthenticationService>;

  beforeEach(async () => {
    access = new ProjectAccessStub();
    access.set(accessFor(member, project()));
    expeditions = jasmine.createSpyObj('ExpeditionService', ['getAccessibleExpeditions', 'getAllExpeditions', 'getExpeditionsForUser']);
    expeditions.getAccessibleExpeditions.and.returnValue(of([memberOnly('FIRST'), memberOnly('SECOND')]));
    photos = jasmine.createSpyObj('PhotoService', ['precheck', 'upload']);
    photos.precheck.and.returnValue(of({ allowed: true }));
    photos.upload.and.returnValue(of({ success: true, errors: [], warnings: [] }));
    projects = jasmine.createSpyObj('ProjectService', ['getProjectConfig', 'getAllProjects', 'updateProject']);
    auth = jasmine.createSpyObj('AuthenticationService', ['ensureActiveSession']);
    auth.ensureActiveSession.and.returnValue(of(true));
    await TestBed.configureTestingModule({ imports: [UploadPhotosComponent], providers: [
      { provide: ProjectAccessService, useValue: access }, { provide: ExpeditionService, useValue: expeditions },
      { provide: PhotoService, useValue: photos }, { provide: ProjectService, useValue: projects },
      { provide: AuthenticationService, useValue: auth }, { provide: NgbModal, useValue: {} }
    ] }).compileComponents();
  });

  function render(): void {
    fixture = TestBed.createComponent(UploadPhotosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function prepare(code = 'SECOND'): void {
    component.file = new File(['preview zip'], 'photos.zip', { type: 'application/zip' });
    component.photoForm.patchValue({ expedition: code, fileName: component.file.name });
  }

  it('lets verified members select member-only expeditions by code and upload when access control is off', async () => {
    render();
    const options = fixture.nativeElement.querySelectorAll('#floatingSelect_expeditions option');
    expect(Array.from(options).map((option: any) => option.value)).toEqual(['', 'FIRST', 'SECOND']);
    expect(options[2].textContent).toContain('Duplicate title (SECOND)');
    prepare();
    await component.verifyValidations();
    expect(expeditions.getAccessibleExpeditions).toHaveBeenCalledWith(access.current);
    expect(expeditions.getAllExpeditions).not.toHaveBeenCalled();
    expect(expeditions.getExpeditionsForUser).not.toHaveBeenCalled();
    expect(photos.precheck.calls.mostRecent().args as unknown[]).toEqual([1, 'SECOND', 'Sample_Photo']);
    expect(photos.upload.calls.mostRecent().args.slice(0, 3)).toEqual([1, 'SECOND', 'Sample_Photo']);
    expect(component.uploadState).toBe('success');
    expect(component.expeditions.every(item => item.visibility === 'project members' && item.public === false)).toBeTrue();
    expect(projects.updateProject).not.toHaveBeenCalled();
  });

  it('permits project owners with string IDs to upload to another owner’s member-only expedition', async () => {
    access.set(accessFor({ ...owner, userId: '42' }, project(true)));
    expeditions.getAccessibleExpeditions.and.returnValue(of([memberOnly('SECOND', member)]));
    render();
    prepare();
    await component.verifyValidations();
    expect(component.expeditions.length).toBe(1);
    expect(photos.upload).toHaveBeenCalled();
  });

  it('allows only owned expeditions for members when expedition access is enforced', async () => {
    access.set(accessFor(member, project(true)));
    expeditions.getAccessibleExpeditions.and.returnValue(of([memberOnly('FIRST'), memberOnly('SECOND', { ...member, userId: '7' })]));
    render();
    expect(component.expeditions.map(item => item.expeditionCode)).toEqual(['SECOND']);
    prepare();
    await component.verifyValidations();
    expect(photos.upload).toHaveBeenCalled();
  });

  it('explains ownership restrictions separately from an empty list and blocks even direct upload calls', async () => {
    access.set(accessFor(member, project(true)));
    render();
    expect(component.accessibleExpeditionCount).toBe(2);
    expect(component.expeditions).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('none is available for photo upload');
    expect(fixture.nativeElement.textContent).not.toContain('No expeditions are available');
    expect(fixture.nativeElement.querySelector('button[type=submit]').disabled).toBeTrue();
    prepare();
    await component.upload();
    expect(photos.precheck).not.toHaveBeenCalled();
    expect(photos.upload).not.toHaveBeenCalled();
  });

  it('rechecks current access rules before submission', async () => {
    render();
    prepare();
    access.current = accessFor(member, project(true));
    await component.verifyValidations();
    expect(photos.precheck).not.toHaveBeenCalled();
    expect(component.selectionPermissionError).toContain('Select an expedition permitted');
  });

  it('requires an owned expedition for an enforced member even with project-wide unique identifiers', async () => {
    access.set(accessFor(member, project(true, true)));
    expeditions.getAccessibleExpeditions.and.returnValue(of([memberOnly('SECOND', member)]));
    render();
    expect(component.requiresExpeditionSelection).toBeTrue();
    expect(component.canUploadAcrossExpeditions).toBeFalse();
    expect(fixture.nativeElement.querySelector('#floatingSelect_expeditions')).not.toBeNull();
    prepare('');
    await component.verifyValidations();
    expect(photos.precheck).not.toHaveBeenCalled();
    prepare();
    await component.verifyValidations();
    expect(photos.precheck.calls.mostRecent().args as unknown[]).toEqual([1, 'SECOND', 'Sample_Photo']);
  });

  for (const account of [member, owner]) {
    it(`allows project-wide uploads for ${account.username} under the applicable rules`, async () => {
      access.set(accessFor(account, project(account === owner, true)));
      render();
      prepare('');
      expect(component.canUploadAcrossExpeditions).toBeTrue();
      await component.verifyValidations();
      expect(photos.precheck.calls.mostRecent().args as unknown[]).toEqual([1, undefined, 'Sample_Photo']);
      expect(photos.upload).toHaveBeenCalled();
    });
  }

  it('waits for the backend precheck before sending the archive', async () => {
    const precheck = new Subject<any>();
    photos.precheck.and.returnValue(precheck);
    render();
    prepare();
    await component.verifyValidations();
    expect(auth.ensureActiveSession).toHaveBeenCalled();
    expect(photos.upload).not.toHaveBeenCalled();
    precheck.next({ allowed: true });
    precheck.complete();
    expect(photos.upload).toHaveBeenCalled();
  });

  it('preserves selection and file when a backend 403 blocks the upload', async () => {
    photos.precheck.and.returnValue(throwError(() => ({ status: 403, error: { usrMessage: 'Photo upload denied by current access rules.' } })));
    render();
    prepare();
    await component.verifyValidations();
    fixture.detectChanges();
    expect(photos.upload).not.toHaveBeenCalled();
    expect(component.uploadState).toBe('error');
    expect(component.uploadErrorInfo?.title).toBe('Permission Denied');
    expect(component.getControlVal('expedition')).toBe('SECOND');
    expect(component.file.name).toBe('photos.zip');
    expect(fixture.nativeElement.querySelector('.alert-success')).toBeNull();
  });

  it('honors an explicit precheck denial', async () => {
    photos.precheck.and.returnValue(of({ allowed: false, message: 'Ownership required.' }));
    render();
    prepare();
    await component.verifyValidations();
    expect(component.uploadErrorInfo?.status).toBe(403);
    expect(photos.upload).not.toHaveBeenCalled();
  });

  it('shows loading failures with retry, rather than saying no expeditions exist', () => {
    expeditions.getAccessibleExpeditions.and.returnValue(throwError(() => ({ status: 500 })));
    render();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Unable to load');
    expect(fixture.nativeElement.textContent).not.toContain('No expeditions are available');
    expect(fixture.nativeElement.textContent).toContain('Retry');
    expect(component.permissionCheckReady).toBeFalse();
  });

  it('shows no expeditions only after a successful empty response', () => {
    expeditions.getAccessibleExpeditions.and.returnValue(of([]));
    render();
    expect(component.permissionCheckReady).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('No expeditions are available');
    expect(component.expeditionLoadError).toBe('');
  });

  it('does not request expeditions until authenticated membership is ready', async () => {
    access.set({ ...accessFor(member, project()), loading: true });
    render();
    expect(expeditions.getAccessibleExpeditions).not.toHaveBeenCalled();
    prepare();
    await component.upload();
    expect(photos.precheck).not.toHaveBeenCalled();
    expect(component.expeditionsLoading).toBeTrue();
  });

  it('does not give public visitors member upload access', () => {
    access.set({ ...accessFor(member, project()), isMember: false, error: 'Your account is not a member.' });
    render();
    expect(component.uploadPermissionExplanation).toContain('not a member');
    expect(expeditions.getAccessibleExpeditions).not.toHaveBeenCalled();
    expect(component.uploadUnavailable).toBeTrue();
  });

  it('drops a stale response when the selected project changes', () => {
    const stale = new Subject<any[]>();
    expeditions.getAccessibleExpeditions.and.returnValue(stale);
    render();
    expeditions.getAccessibleExpeditions.and.returnValue(of([memberOnly('NEW')]));
    access.set(accessFor(member, { ...project(), projectId: 99 }));
    stale.next([memberOnly('OLD')]);
    expect(component.expeditions.map(item => item.expeditionCode)).toEqual(['NEW']);
    expect(component.currentProject.projectId).toBe(99);
  });
});

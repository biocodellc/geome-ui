import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { of, Subject, throwError } from 'rxjs';
import { ExpeditionsSettingComponent } from './expeditions-setting.component';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { ProjectAccessService } from '../../../../helpers/services/project-access.service';
import { accessFor, expedition, member, memberProject, owner, ProjectAccessStub } from '../../../../helpers/testing/project-access.fixture';

describe('ExpeditionsSettingComponent permissions', () => {
  let fixture: ComponentFixture<ExpeditionsSettingComponent>;
  let component: ExpeditionsSettingComponent;
  let access: ProjectAccessStub;
  let expeditions: jasmine.SpyObj<ExpeditionService>;
  let toastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    access = new ProjectAccessStub();
    expeditions = jasmine.createSpyObj('ExpeditionService', ['getAccessibleExpeditions', 'updateExpedition', 'deleteExpedition']);
    expeditions.getAccessibleExpeditions.and.returnValue(of([expedition]));
    toastr = jasmine.createSpyObj('ToastrService', ['success']);
    await TestBed.configureTestingModule({
      imports: [ExpeditionsSettingComponent],
      providers: [provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ id: '2' }) } },
        { provide: ProjectAccessService, useValue: access },
        { provide: ExpeditionService, useValue: expeditions },
        { provide: ToastrService, useValue: toastr },
        { provide: NgbModal, useValue: { open: jasmine.createSpy('open') } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ExpeditionsSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('opens another owner’s member-visible expedition with a selectable read-only description', () => {
    expect(component.currentExpedition.expeditionCode).toBe('PC2202L1');
    const root = fixture.nativeElement as HTMLElement;
    const description = root.querySelector<HTMLTextAreaElement>('#Description')!;
    expect(description.readOnly).toBeTrue();
    expect(description.disabled).toBeFalse();
    expect(description.value).toBe(expedition.metadata.Description);
    expect(component.form['expeditionTitle'].disabled).toBeTrue();
    expect(root.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBeTrue();
    expect(root.textContent).toContain('You are viewing PC2202L1 as a member of MDBC.');
    expect(root.textContent).toContain('This expedition is owned by stweedt.');
    expect(root.querySelector('.bg-danger-subtle')).toBeNull();
    expect(root.querySelector('a[fragment]')?.getAttribute('href') || root.innerHTML).toContain('expedition-access-control');
    component.updateExpedition();
    expect(expeditions.updateExpedition).not.toHaveBeenCalled();
  });

  it('allows an expedition owner with a string ID to edit and save', () => {
    access.set(accessFor({ ...owner, userId: '42' }));
    component.form['Description'].setValue('Updated description');
    expeditions.updateExpedition.and.callFake((_projectId, value) => of(value));
    component.updateExpedition();
    expect(expeditions.updateExpedition).toHaveBeenCalled();
    expect(expeditions.updateExpedition.calls.mostRecent().args[1].metadata.Description).toBe('Updated description');
    expect(toastr.success).toHaveBeenCalled();
  });

  it('allows the project owner to edit expeditions owned by someone else', () => {
    access.set(accessFor(member, { ...memberProject, user: { ...member, userId: '7' } }));
    expect(component.isExpeditionOwner).toBeFalse();
    expect(component.isProjectOwner).toBeTrue();
    expect(component.canEditExpeditionSettings).toBeTrue();
  });

  it('never derives settings permission from the access control checkbox', () => {
    for (const enforceExpeditionAccess of [true, false]) {
      access.set(accessFor(member, { ...memberProject, enforceExpeditionAccess }));
      expect(component.canEditExpeditionSettings).toBeFalse();
      component.updateExpedition();
    }
    expect(expeditions.updateExpedition).not.toHaveBeenCalled();
  });

  it('rechecks ownership at submission time instead of trusting an enabled form', () => {
    access.set(accessFor(owner));
    expect(component.canEditExpeditionSettings).toBeTrue();
    access.current = accessFor(member);
    component.updateExpedition();
    expect(expeditions.updateExpedition).not.toHaveBeenCalled();
    expect(component.form['expeditionTitle'].disabled).toBeTrue();
  });

  it('keeps drafts on a 403 and does not report success', () => {
    access.set(accessFor(owner));
    component.form['Description'].setValue('Draft that must be preserved');
    component.form['Description'].markAsDirty();
    expeditions.updateExpedition.and.returnValue(throwError(() => ({ status: 403 })));
    component.updateExpedition();
    fixture.detectChanges();
    expect(component.form['Description'].value).toBe('Draft that must be preserved');
    expect(component.saveError).toContain('server denied permission');
    expect(component.saveError).toContain('stweedt');
    expect(component.canEditExpeditionSettings).toBeFalse();
    expect(component.isSaving).toBeFalse();
    expect(toastr.success).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#Description').value).toBe('Draft that must be preserved');
  });

  it('shows load and missing-expedition errors instead of a blank page', () => {
    expeditions.getAccessibleExpeditions.and.returnValue(throwError(() => ({ status: 403 })));
    access.set(accessFor());
    expect(component.isLoading).toBeFalse();
    expect(component.loadError).toContain('permission');
    expeditions.getAccessibleExpeditions.and.returnValue(of([]));
    access.set(accessFor());
    expect(component.loadError).toContain('not found');
  });

  it('disables writes while identity or project information is loading', () => {
    access.set({ ...accessFor(owner), loading: true });
    component.updateExpedition();
    expect(component.canEditExpeditionSettings).toBeFalse();
    expect(expeditions.updateExpedition).not.toHaveBeenCalled();
  });

  it('does not use stale ownership while refreshed expedition details are still loading', () => {
    access.set(accessFor(owner));
    expeditions.getAccessibleExpeditions.and.returnValue(new Subject<any[]>());
    access.set(accessFor(owner));
    component.updateExpedition();
    expect(component.isLoading).toBeTrue();
    expect(expeditions.updateExpedition).not.toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { throwError } from 'rxjs';
import { ProjectSettingComponent } from './project-setting.component';
import { ProjectService } from '../../../../../helpers/services/project.service';
import { ProjectAccessService } from '../../../../../helpers/services/project-access.service';
import { accessFor, owner, ProjectAccessStub } from '../../../../../helpers/testing/project-access.fixture';

describe('ProjectSettingComponent access controls', () => {
  let access: ProjectAccessStub;
  let projects: jasmine.SpyObj<ProjectService>;
  let toastr: jasmine.SpyObj<ToastrService>;
  beforeEach(async () => {
    access = new ProjectAccessStub();
    projects = jasmine.createSpyObj('ProjectService', ['updateProject', 'loadAllProjects']);
    toastr = jasmine.createSpyObj('ToastrService', ['success']);
    await TestBed.configureTestingModule({ imports: [ProjectSettingComponent], providers: [
      provideRouter([]), { provide: ProjectAccessService, useValue: access },
      { provide: ProjectService, useValue: projects }, { provide: ToastrService, useValue: toastr },
      { provide: NgbModal, useValue: {} }
    ] }).compileComponents();
  });

  it('shows the anchored checkbox read-only to a verified member', () => {
    const fixture = TestBed.createComponent(ProjectSettingComponent);
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector('#expedition-access-control input');
    expect(checkbox.disabled).toBeTrue();
    expect(checkbox.checked).toBeFalse();
    fixture.componentInstance.update();
    expect(projects.updateProject).not.toHaveBeenCalled();
  });

  it('enables the checkbox only for the project owner and retains a rejected draft', () => {
    access.set(accessFor({ ...owner, userId: '42' }));
    const fixture = TestBed.createComponent(ProjectSettingComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.form['enforceExpeditionAccess'].enabled).toBeTrue();
    component.form['enforceExpeditionAccess'].setValue(true);
    projects.updateProject.and.returnValue(throwError(() => ({ status: 403 })));
    component.update();
    expect(component.form['enforceExpeditionAccess'].value).toBeTrue();
    expect(component.form['enforceExpeditionAccess'].disabled).toBeTrue();
    expect(component.saveError).toContain('server denied permission');
    expect(toastr.success).not.toHaveBeenCalled();
  });
});

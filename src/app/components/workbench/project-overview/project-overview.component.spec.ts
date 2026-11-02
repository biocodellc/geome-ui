import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ProjectOverviewComponent } from './project-overview.component';
import { ProjectService } from '../../../../helpers/services/project.service';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { QueryService } from '../../../../helpers/services/query.service';
import { DataService } from '../../../../helpers/services/data.service';
import { FileService } from '../../../../helpers/services/file.service';

// Public project responses can omit the team owner even when networkApproved is true.
describe('ProjectOverviewComponent partial project responses', () => {
  let projects: BehaviorSubject<any>;
  beforeEach(async () => {
    projects = new BehaviorSubject<any>(null);
    await TestBed.configureTestingModule({ imports: [ProjectOverviewComponent], providers: [
      provideRouter([]),
      { provide: ProjectService, useValue: { currentProject$: () => projects } },
      { provide: ExpeditionService, useValue: { stats: () => of([]) } },
      { provide: DummyDataService, useValue: { loadingState: new BehaviorSubject(false) } },
      { provide: QueryService, useValue: {} }, { provide: DataService, useValue: {} },
      { provide: FileService, useValue: {} }, { provide: ToastrService, useValue: {} }
    ] }).compileComponents();
  });

  it('renders before project data arrives and with missing owner or configuration', () => {
    const fixture = TestBed.createComponent(ProjectOverviewComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    projects.next({ projectId: 1, projectTitle: 'Sparse project' });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('Not available');
    expect(fixture.nativeElement.querySelector('a[href="mailto:undefined"]')).toBeNull();
  });

  it('renders an approved team without a team user or email', () => {
    projects.next({ projectId: 1, projectConfiguration: { name: 'MDBC', networkApproved: true } });
    const fixture = TestBed.createComponent(ProjectOverviewComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.textContent).toContain('MDBC team');
    expect(fixture.nativeElement.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it('updates owner and team contact links when populated data arrives', () => {
    const fixture = TestBed.createComponent(ProjectOverviewComponent);
    fixture.detectChanges();
    projects.next({ projectId: 1, user: { username: 'owner', email: 'owner@example.test' },
      projectConfiguration: { name: 'MDBC', networkApproved: true, user: { email: 'team@example.test' } } });
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelector('a[href="mailto:owner@example.test"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a[href="mailto:team@example.test"]')).not.toBeNull();
  });

  it('handles expedition rows before configuration entities are available', () => {
    projects.next({ projectId: 1 });
    const fixture = TestBed.createComponent(ProjectOverviewComponent);
    const component = fixture.componentInstance;
    component.headers = ['SampleCount'];
    component.displayExpedition = [{ expeditionCode: 'TEST', SampleCount: 1 }];
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(component.menuOptions(component.displayExpedition[0])).toEqual([]);
    expect(component.worksheetEntities()).toEqual([]);
  });
});

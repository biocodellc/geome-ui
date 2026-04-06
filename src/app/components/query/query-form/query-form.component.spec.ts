import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { QueryFormComponent } from './query-form.component';
import { AuthenticationService } from '../../../../helpers/services/authentication.service';
import { DummyDataService } from '../../../../helpers/services/dummy-data.service';
import { ExpeditionService } from '../../../../helpers/services/expedition.service';
import { MapQueryService } from '../../../../helpers/services/map-query.service';
import { NetworkService } from '../../../../helpers/services/network.service';
import { ProjectConfigurationService } from '../../../../helpers/services/project-config.service';
import { ProjectService } from '../../../../helpers/services/project.service';
import { QueryService } from '../../../../helpers/services/query.service';

describe('QueryFormComponent', () => {
  let component: QueryFormComponent;
  let fixture: ComponentFixture<QueryFormComponent>;
  let expeditionService: jasmine.SpyObj<ExpeditionService>;
  let authService: jasmine.SpyObj<AuthenticationService>;

  const projects = [
    {
      projectId: 1,
      projectTitle: 'Project 1',
      projectConfiguration: { id: 10, name: 'Config 1' },
    },
  ];

  beforeEach(async () => {
    expeditionService = jasmine.createSpyObj('ExpeditionService', [
      'getAllExpeditions',
      'getExpeditionsForUser',
    ]);
    authService = jasmine.createSpyObj('AuthenticationService', ['getUserFromStorage']);

    expeditionService.getAllExpeditions.and.returnValue(of([]));
    expeditionService.getExpeditionsForUser.and.returnValue(of([]));
    authService.getUserFromStorage.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [QueryFormComponent],
      providers: [
        {
          provide: ProjectService,
          useValue: {
            getAllProjectsValue: () => of(projects),
            currentProject$: () => of(null),
            sortWithKey: (items: any[]) => items,
            userProjectSubject: new BehaviorSubject([]),
          },
        },
        {
          provide: NetworkService,
          useValue: {
            getConfig: () =>
              of({
                entities: [],
                getList: () => ({ fields: [] }),
              }),
          },
        },
        {
          provide: ProjectConfigurationService,
          useValue: {
            get: () =>
              of({
                config: {
                  entities: [],
                },
              }),
          },
        },
        { provide: ExpeditionService, useValue: expeditionService },
        { provide: AuthenticationService, useValue: authService },
        {
          provide: DummyDataService,
          useValue: { loadingState: new BehaviorSubject(false) },
        },
        {
          provide: QueryService,
          useValue: {
            queryJson: () => of({ data: [] }),
          },
        },
        {
          provide: MapQueryService,
          useValue: {
            clearBounds: jasmine.createSpy('clearBounds'),
            setQueryMarkers: jasmine.createSpy('setQueryMarkers'),
          },
        },
        { provide: ToastrService, useValue: jasmine.createSpyObj('ToastrService', ['info']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QueryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads private expeditions for authenticated users when a project is selected', () => {
    const privateExpeditions = [{ expeditionCode: 'PRIVATE_1', expeditionTitle: 'Private 1' }];
    authService.getUserFromStorage.and.returnValue({ accessToken: 'token' });
    expeditionService.getExpeditionsForUser.and.returnValue(of(privateExpeditions));
    component.individualProjects = ['Project 1'];

    component.getExpeditions();

    expect(expeditionService.getExpeditionsForUser).toHaveBeenCalledWith(1, true);
    expect(expeditionService.getAllExpeditions).not.toHaveBeenCalled();
    expect(component.expeditions).toEqual(privateExpeditions);
  });

  it('falls back to the public expedition endpoint if the authenticated request fails', () => {
    const publicExpeditions = [{ expeditionCode: 'PUBLIC_1', expeditionTitle: 'Public 1' }];
    authService.getUserFromStorage.and.returnValue({ accessToken: 'token' });
    expeditionService.getExpeditionsForUser.and.returnValue(
      throwError(() => new Error('forbidden')),
    );
    expeditionService.getAllExpeditions.and.returnValue(of(publicExpeditions));
    component.individualProjects = ['Project 1'];

    component.getExpeditions();

    expect(expeditionService.getExpeditionsForUser).toHaveBeenCalledWith(1, true);
    expect(expeditionService.getAllExpeditions).toHaveBeenCalledWith(1);
    expect(component.expeditions).toEqual(publicExpeditions);
  });

  it('uses the authenticated expedition endpoint for structured query routes', () => {
    const expeditions = [{ expeditionCode: 'PRIVATE_1', expeditionTitle: 'Private 1' }];
    authService.getUserFromStorage.and.returnValue({ accessToken: 'token' });
    expeditionService.getExpeditionsForUser.and.returnValue(of(expeditions));
    component.requestedParams = {
      projectId: '1',
      expeditionCode: 'PRIVATE_1',
      entity: 'Sample',
    };
    spyOn(component, 'queryJson');

    component.applyStructuredRouteParams();

    expect(expeditionService.getExpeditionsForUser).toHaveBeenCalledWith(1, true);
    expect(component.params.expeditions).toEqual(expeditions);
    expect(component.queryJson).toHaveBeenCalled();
  });
});

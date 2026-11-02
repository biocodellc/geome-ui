import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { ProjectAccess, ProjectAccessService, sameUserId } from './project-access.service';
import { AuthenticationService } from './authentication.service';
import { ProjectService } from './project.service';
import { UserService } from './user.service';

import { member, owner, memberProject } from '../testing/project-access.fixture';

describe('ProjectAccessService', () => {
  let users: BehaviorSubject<any>;
  let projects: BehaviorSubject<any>;
  let memberships: Subject<any[]>;
  let access: ProjectAccess;
  let service: ProjectAccessService;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    users = new BehaviorSubject<any>(member);
    projects = new BehaviorSubject<any>(memberProject);
    memberships = new Subject<any[]>();
    userService = jasmine.createSpyObj('UserService', ['getUserData']);
    TestBed.configureTestingModule({ providers: [
      { provide: AuthenticationService, useValue: { currentUser: users } },
      { provide: ProjectService, useValue: { currentProject$: () => projects, getAuthenticatedProjects: () => memberships } },
      { provide: UserService, useValue: userService }
    ] });
    service = TestBed.inject(ProjectAccessService);
    service.context$.subscribe(value => access = value);
  });

  it('waits for authenticated membership and does not assume a public project grants membership', () => {
    expect(access.loading).toBeTrue();
    expect(access.isProjectOwner).toBeFalse();
    memberships.next([]);
    expect(access.isMember).toBeFalse();
    expect(access.error).toContain('not a member');
  });

  it('recognizes member and owner IDs across string/number representations', () => {
    memberships.next([{ ...memberProject, projectId: '1' }]);
    expect(access.isMember).toBeTrue();
    expect(access.isProjectOwner).toBeFalse();
    users.next({ ...owner, userId: '42' });
    memberships.next([memberProject]);
    expect(access.isProjectOwner).toBeTrue();
  });

  it('does not equate absent or blank user IDs', () => {
    expect(sameUserId({}, {})).toBeFalse();
    expect(sameUserId({ userId: '' }, { userId: '' })).toBeFalse();
    expect(sameUserId({ userId: null }, { userId: undefined })).toBeFalse();
    expect(sameUserId({ userId: '42' }, owner)).toBeTrue();
  });

  it('waits for a populated identity before granting ownership', () => {
    const identity = new Subject<any>();
    userService.getUserData.and.returnValue(identity);
    users.next({ username: 'stweedt', accessToken: 'session' });
    memberships.next([memberProject]);
    expect(access.loading).toBeTrue();
    expect(access.isProjectOwner).toBeFalse();
    identity.next(owner);
    memberships.next([memberProject]);
    expect(access.loading).toBeFalse();
    expect(access.isProjectOwner).toBeTrue();
  });

  it('reports a membership failure instead of treating it as an empty list', () => {
    memberships.error({ status: 403 });
    expect(access.error).toContain('Unable to verify');
    expect(access.isMember).toBeFalse();
    expect(access.loading).toBeFalse();
  });

  it('reports an identity load failure and clears previous permissions on sign-out', () => {
    userService.getUserData.and.returnValue(throwError(() => new Error('offline')));
    users.next({ username: 'stweedt' });
    expect(access.error).toContain('Unable to verify');
    users.next(null);
    expect(access.isMember).toBeFalse();
    expect(access.error).toContain('Sign in');
  });
});

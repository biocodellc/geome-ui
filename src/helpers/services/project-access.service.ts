import { inject, Injectable } from '@angular/core';
import { catchError, combineLatest, map, of, shareReplay, startWith, Subject, switchMap, tap } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { ProjectService } from './project.service';
import { UserService } from './user.service';

export function sameUserId(first: any, second: any): boolean {
  const firstId = first?.userId;
  const secondId = second?.userId;
  return firstId !== undefined && firstId !== null && String(firstId).trim() !== '' &&
    secondId !== undefined && secondId !== null && String(secondId).trim() !== '' &&
    String(firstId) === String(secondId);
}

export interface ProjectAccess {
  user: any;
  project: any;
  loading: boolean;
  isMember: boolean;
  isProjectOwner: boolean;
  error: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectAccessService {
  private auth = inject(AuthenticationService);
  private projects = inject(ProjectService);
  private users = inject(UserService);
  private reload$ = new Subject<void>();

  current: ProjectAccess = { user: null, project: null, loading: true, isMember: false, isProjectOwner: false, error: '' };

  readonly context$ = combineLatest([
    this.auth.currentUser,
    this.projects.currentProject$(),
    this.reload$.pipe(startWith(undefined))
  ]).pipe(
    switchMap(([user, project]) => {
      const pending: ProjectAccess = { user, project, loading: true, isMember: false, isProjectOwner: false, error: '' };
      if (!project) return of({ ...pending, loading: false, error: 'Select a project to view its expeditions and settings.' });
      if (!user) return of({ ...pending, loading: false, error: 'Sign in to view member-accessible expeditions and project settings.' });

      // During sign-in the session may contain a token and username before the user ID arrives.
      const identity$ = sameUserId(user, user) ? of(user) : this.users.getUserData(user.username);
      return identity$.pipe(
        switchMap(identity => this.projects.getAuthenticatedProjects().pipe(map(projects => ({ identity, projects })))),
        map(({ identity, projects }): ProjectAccess => {
          if (!sameUserId(identity, identity)) throw new Error('Account information is incomplete.');
          const memberProject = projects.find((item: any) => String(item.projectId) === String(project.projectId));
          // Public visibility alone never establishes membership or ownership.
          const authenticatedProject = memberProject ? { ...project, ...memberProject, config: project.config } : project;
          return {
            user: identity, project: authenticatedProject, loading: false,
            isMember: !!memberProject,
            isProjectOwner: !!memberProject && sameUserId(identity, memberProject.user),
            error: memberProject ? '' : `Your account is not a member of ${authenticatedProject.projectTitle}. View public data on Project Overview.`
          };
        }),
        catchError(() => of({ ...pending, loading: false, error: 'Unable to verify your account and project membership. Please retry before opening member details or changing settings.' })),
        startWith(pending)
      );
    }),
    tap(context => this.current = context),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  retry(): void {
    this.projects.clearAuthenticatedProjectsCache();
    this.reload$.next();
  }
}

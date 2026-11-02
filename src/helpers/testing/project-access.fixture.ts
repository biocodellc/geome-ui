import { BehaviorSubject } from 'rxjs';
import { ProjectAccess, sameUserId } from '../services/project-access.service';

export const member = { userId: 7, username: 'biocode' };
export const owner = { userId: 42, username: 'stweedt' };
export const memberProject = {
  projectId: 1, projectTitle: 'MDBC', description: 'Project description', user: owner,
  public: true, discoverable: true, enforceExpeditionAccess: false,
  config: { expeditionMetadataProperties: [{ name: 'Description', type: 'STRING', required: true }] }
};
export const expedition = {
  expeditionId: 2, expeditionCode: 'PC2202L1', expeditionTitle: '2022: PC2202L1',
  visibility: 'project members', user: owner, metadata: { Description: 'The full expedition description.' }
};
export function accessFor(user: any = member, project: any = memberProject): ProjectAccess {
  return { user, project, loading: false, error: '', isMember: true, isProjectOwner: sameUserId(user, project.user) };
}

// Shared controllable context for component regression tests.
export class ProjectAccessStub {
  current = accessFor();
  context$ = new BehaviorSubject(this.current);
  retry = jasmine.createSpy('retry');
  set(value: ProjectAccess): void { this.current = value; this.context$.next(value); }
}

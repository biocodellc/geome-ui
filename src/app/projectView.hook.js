import { EventEmitter } from 'events';

export const STARTED_HOOK_EVENT = 'started_hook';
export const ENDED_HOOK_EVENT = 'ended_hook';
export const LOADING_PROJECT_EVENT = 'loading_project';
export const FINISHED_LOADING_PROJECT_EVENT = 'finished_loading_project';

export function checkProjectViewPresent(state) {
  let s = state;

  do {
    if (s.name === 'projectView') {
      return true;
    }
    s = s.parent;
  } while (s);

  return false;
}

export const ProjectViewHookEmitter = new EventEmitter();

export default (
  $rootScope,
  $location,
  $transitions,
  $mdDialog,
  ProjectService,
  UserService,
) => {
  'ngInject';

  let prevState;
  $transitions.onSuccess({}, trans => (prevState = trans.to().name));
  // setup dialog for workbench states if no project is selected
  $transitions.onBefore(
    { to: checkProjectViewPresent },
    async trans => {
      const projectId = parseInt($location.search().projectId, 10);
      if (
        ProjectService.currentProject() &&
        (!projectId || ProjectService.currentProject().projectId === projectId)
      ) {
        return Promise.resolve();
      }

      ProjectViewHookEmitter.emit(STARTED_HOOK_EVENT);
      trans.onFinish({}, () => {
        ProjectViewHookEmitter.emit(ENDED_HOOK_EVENT);
      });

      const setProject = project => {
        ProjectViewHookEmitter.emit(LOADING_PROJECT_EVENT);
        return ProjectService.setCurrentProject(project).then(() => {
          ProjectViewHookEmitter.emit(FINISHED_LOADING_PROJECT_EVENT);
        });
      };

      if (projectId) {
        try {
          const project = await ProjectService.get(projectId, false);
          if (project) return setProject(project);
        } catch (e) {}
      }
      const currentUser = UserService.currentUser();
      const isAuthenticated = !!currentUser;
      // if there is only a single project the currentUser is a member, auto-select that project
      // project loads are cached so we don't fetch 2x if there are multiple projects
      try {
        const res = await ProjectService.all(!isAuthenticated);
        if (res.data.length === 1) return setProject(res.data[0]);
      } catch (e) {}

      const scope = Object.assign($rootScope.$new(true), {
        isAuthenticated,
        userHasProject: isAuthenticated && currentUser.userHasProject,
      });
      return $mdDialog
        .show({
          template:
            '<project-selector-dialog is-authenticated="isAuthenticated" user-has-project="userHasProject"></project-selector-dialog>',
          scope,
        })
        .then(setProject)
        .catch(targetState => {
          if (targetState && targetState.withParams) {
            return targetState.withParams({
              nextState: trans.to(),
              nextStateParams: trans.to().params,
            });
          }

          let state = prevState || 'query';

          if (!UserService.currentUser() && checkProjectViewPresent(state)) {
            state = 'query';
          }

          return trans.router.stateService.target(state);
        });
    },
    { priority: 50 },
  );
};

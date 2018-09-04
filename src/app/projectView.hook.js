import { EventEmitter } from 'events';

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

export const ProjectLoadingEmitter = new EventEmitter();

export default (
  $rootScope,
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
      if (ProjectService.currentProject()) return Promise.resolve();

      const setProject = project => {
        ProjectLoadingEmitter.emit(LOADING_PROJECT_EVENT);
        return ProjectService.setCurrentProject(project).then(() => {
          ProjectLoadingEmitter.emit(FINISHED_LOADING_PROJECT_EVENT);
        });
      };

      const isAuthenticated = !!UserService.currentUser();
      // if there is only a single project the currentUser is a member, auto-select that project
      // project loads are cached so we don't fetch 2x if there are multiple projects
      try {
        const res = await ProjectService.all(!isAuthenticated);
        if (res.data.length === 1) return setProject(res.data[0]);
      } catch (e) {}

      const scope = Object.assign($rootScope.$new(true), {
        isAuthenticated,
      });
      return $mdDialog
        .show({
          template:
            '<project-selector-dialog is-authenticated="isAuthenticated"></project-selector-dialog>',
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

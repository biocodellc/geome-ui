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
    trans => {
      if (ProjectService.currentProject()) return Promise.resolve();

      const scope = Object.assign($rootScope.$new(true), {
        isAuthenticated: !!UserService.currentUser(),
      });
      return $mdDialog
        .show({
          template:
            '<project-selector-dialog is-authenticated="isAuthenticated"></project-selector-dialog>',
          scope,
        })
        .then(project => {
          ProjectLoadingEmitter.emit(LOADING_PROJECT_EVENT);
          return ProjectService.setCurrentProject(project);
        })
        .then(() => {
          ProjectLoadingEmitter.emit(FINISHED_LOADING_PROJECT_EVENT);
        })
        .catch(targetState => {
          const stateService = trans.router.stateService;

          if (targetState && targetState.withParams) {
            return stateService.target(targetState._identifier, {
              nextState: trans.to(),
              nextStateParams: trans.to().params,
            });
          }

          let state = prevState || 'query';

          if (!UserService.currentUser() && checkProjectViewPresent(state)) {
            state = 'query';
          }

          return stateService.target(state);
        });
    },
    { priority: 50 },
  );
};

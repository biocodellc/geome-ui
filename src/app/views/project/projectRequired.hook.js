import { executeIfTransitionValid } from '../../utils/router';

export function checkProjectRequired(state) {
  let s = state;

  do {
    if (s.projectRequired) {
      return true;
    }
    s = s.parent;
  } while (s);

  return false;
}

export default ($transitions, ProjectService) => {
  'ngInject';

  $transitions.onBefore({}, trans => {
    const to = trans.$to();
    if (checkProjectRequired(to) && !ProjectService.currentProject()) {
      return executeIfTransitionValid(trans, $transitions, () =>
        trans.router.stateService.target('home'),
      );
    }
  });
};

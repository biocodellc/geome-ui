function checkProjectRequired(state) {
  let s = state;

  do {
    if (s.projectRequired) {
      return true;
    }
    s = s.parent;
  } while (s);

  return false;
}

export default ($rootScope, $transitions, ProjectService) => {
  'ngInject';

  $transitions.onBefore({}, trans => {
    const to = trans.$to();
    if (checkProjectRequired(to) && !ProjectService.currentProject()) {
      return trans.router.stateService.target('home');
    }
  });
};

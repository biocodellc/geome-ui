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

export default ($transitions, Projects) => {
  'ngInject';

  $transitions.onBefore({}, function (trans) {
    const to = trans.$to();
    if (checkProjectRequired(to)) {
      return Projects.waitForProject()
        .catch(() => trans.router.stateService.target('home'));
    }
  });
}


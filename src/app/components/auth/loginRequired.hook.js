function checkLoginRequired(state) {
  let s = state;

  do {
    if (s.loginRequired) {
      return true;
    }
    s = s.parent;
  } while (s);

  return false;
}

export default ($transitions, UserService) => {
  'ngInject';

  $transitions.onBefore({}, (trans) => {
    const to = trans.$to();
    if (checkLoginRequired(to) && !UserService.currentUser()) {
      return trans.router.stateService.target('login', { nextState: to.name, nextStateParams: to.params });
    }
  }, { priority: 100 });
}

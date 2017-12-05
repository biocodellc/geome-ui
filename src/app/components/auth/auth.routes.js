const routing = ($transitions, routerHelper, UserService) => {
  routerHelper.configureStates(getStates());

  $transitions.onBefore({}, _redirectIfLoginRequired, { priority: 100 });

  function _redirectIfLoginRequired(trans) {
    const to = trans.$to();
    if (_checkLoginRequired(to)) {
      return UserService.waitForUser()
        .catch(function () {
          return trans.router.stateService.target('login', { nextState: to.name, nextStateParams: to.params });
        });
    }
  }

  function _checkLoginRequired(state) {
    let s = state;

    do {
      if (s.loginRequired) {
        return true;
      }
      s = s.parent;
    } while (s);

    return false;
  }
};

function getStates() {
  return [
    {
      state: 'login',
      config: {
        url: "/login",
        template: require("./login.html"),
        controller: "LoginController as login",
        params: {
          nextState: null,
          nextStateParams: null,
        },
      },
    },
  ];
}

routing.$inject = [ '$transitions', 'routerHelper', 'UserService' ];

export default routing;

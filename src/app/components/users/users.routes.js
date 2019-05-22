function getStates() {
  return [
    {
      state: 'resetPass',
      config: {
        url: '/resetPass',
        component: 'fimsResetPass',
      },
    },
    {
      state: 'profile',
      config: {
        parent: 'projectView',
        url: '/user/profile',
        component: 'fimsProfile',
        loginRequired: true,
        projectRequired: false,
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

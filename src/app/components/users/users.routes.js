function getStates() {
  return [
    {
      state: 'resetPass',
      config: {
        url: "/resetPass",
        component: 'fimsResetPass',
      },
    },
    {
      state: 'create',
      config: {
        url: "/user/create?id&email",
        component: 'fimsNewUser',
      },
    },
    {
      state: 'profile',
      config: {
        url: "/user/profile",
        component: 'fimsProfile',
        loginRequired: true,
      },
    },
  ];
}

export default (routerHelper) => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

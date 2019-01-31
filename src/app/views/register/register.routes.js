function getStates() {
  return [
    {
      state: 'register',
      config: {
        parent: 'containerPageView',
        url: '/register?inviteId&email',
        component: 'fimsRegister',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'register',
      config: {
        parent: 'containerPageView',
        url: '/register',
        component: 'fimsRegister',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

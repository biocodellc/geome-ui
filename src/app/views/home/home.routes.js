function getStates() {
  return [
    {
      state: 'home',
      config: {
        parent: 'containerPageView',
        url: '/',
        component: 'home',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'about',
      config: {
        parent: 'containerPageView',
        url: '/about',
        component: 'about',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

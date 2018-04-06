function getStates() {
  return [
    {
      state: 'about',
      config: {
        parent: 'containerPageView',
        url: '/',
        component: 'about',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

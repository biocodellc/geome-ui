function getStates() {
  return [
    {
      state: 'contact',
      config: {
        parent: 'containerPageView',
        url: '/contact',
        component: 'contact',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

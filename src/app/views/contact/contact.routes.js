function getStates() {
  return [
    {
      state: 'contact',
      config: {
        parent: 'containerPageView',
        url: '/contact',
        component: 'contact',
        resolve: {
          layout: () => 'column',
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

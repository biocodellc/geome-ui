function getStates() {
  return [
    {
      state: 'about',
      config: {
        parent: 'containerPageView',
        url: '/',
        component: 'about',
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

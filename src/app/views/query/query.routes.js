function getStates() {
  return [
    {
      state: 'query',
      config: {
        url: '/',
        component: 'fimsQuery',
        resolve: {
          layout: () => 'column',
          layoutFill: () => '',
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

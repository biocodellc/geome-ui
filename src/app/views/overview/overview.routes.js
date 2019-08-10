function getStates() {
  return [
    {
      state: 'overview',
      config: {
        parent: 'projectView',
        url: '/overview',
        component: 'fimsOverview',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'project-overview',
      config: {
        parent: 'projectView',
        url: '/project-overview',
        component: 'fimsProjectOverview',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

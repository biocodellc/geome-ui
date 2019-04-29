function getStates() {
  return [
    {
      state: 'dashboard',
      config: {
        parent: 'projectView',
        url: '/overview',
        component: 'fimsDashboard',
      },
    },
    {
      state: 'dashboardExpedition',
      config: {
        parent: 'projectView',
        url: '/project/detail',
        component: 'fimsDashboardExpedition',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

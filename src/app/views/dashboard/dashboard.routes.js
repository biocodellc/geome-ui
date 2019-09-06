function getStates() {
  return [
    {
      state: 'dashboard',
      config: {
        parent: 'projectView',
        url: '/dashboard',
        component: 'fimsDashboard',
        projectRequired: false,
      },
    },
  ];
}
export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

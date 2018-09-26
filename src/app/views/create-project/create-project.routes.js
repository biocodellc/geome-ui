function getStates() {
  return [
    {
      state: 'create-project',
      config: {
        parent: 'containerPageView',
        url: '/project/new',
        component: 'fimsCreateProject',
        loginRequired: true,
        resolve: {
          configurations: /* @ngInject */ ProjectConfigurationService =>
            ProjectConfigurationService.all(true, true),
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

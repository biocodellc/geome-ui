function getStates() {
  return [
    {
      state: 'template',
      config: {
        parent: 'projectView',
        url: '/template',
        component: 'fimsTemplates',
        resolve: {
          allProjects: /* @ngInject */ ProjectService =>
            ProjectService.all(true),
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

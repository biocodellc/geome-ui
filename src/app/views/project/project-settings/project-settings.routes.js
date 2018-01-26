function getStates() {
  return [
    {
      state: 'project.settings',
      config: {
        url: '/settings',
        views: {
          details: {
            component: 'fimsProjectSettings',
          },
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'template',
      config: {
        url: '/template',
        component: 'fimsTemplates',
        projectRequired: true,
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

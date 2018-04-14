function getStates() {
  return [
    {
      state: 'template',
      config: {
        parent: 'projectView',
        url: '/template',
        component: 'fimsTemplates',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

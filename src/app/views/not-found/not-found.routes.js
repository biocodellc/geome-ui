function getStates() {
  return [
    {
      state: 'notFound',
      config: {
        url: '*path',
        component: 'notFound',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'contact',
      config: {
        url: '/contact',
        component: 'contact',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

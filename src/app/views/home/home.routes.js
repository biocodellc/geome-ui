function getStates() {
  return [
    {
      state: 'home',
      config: {
        url: '/',
        component: 'home',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'forbidden',
      config: {
        url: '*path',
        component: 'forbidden',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

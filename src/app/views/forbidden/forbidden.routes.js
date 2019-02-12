function getStates() {
  return [
    {
      state: 'forbidden',
      config: {
        url: '*path',
        component: 'forbidden',
        params: {
          nextState: null,
          nextStateParams: null,
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

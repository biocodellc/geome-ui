function getStates() {
  return [
    {
      state: 'forbidden',
      config: {
        url: '/403',
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

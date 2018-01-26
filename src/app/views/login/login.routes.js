function getStates() {
  return [
    {
      state: 'login',
      config: {
        url: '/login',
        component: 'fimsLogin',
        params: {
          nextState: null,
          nextStateParams: null,
        },
      },
    },
  ];
}

export default ($transitions, routerHelper) => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

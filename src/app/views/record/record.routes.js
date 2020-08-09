function getStates() {
  return [
    {
      state: 'record',
      config: {
        parent: 'containerPageView',
        url: '/record/*bcid',
        component: 'fimsRecord',
        resolve: {
          /* @ngInject */

          record: (RecordService, $stateParams, $state) => {
            const { bcid } = $stateParams;
            return RecordService.get(bcid.trim(), { skipAuthRedirect: true })
              .then(response => {
                // fail using the 404 route
                if (response.status === 204) {
                  $state.go('notFound', { path: '404' });
                }
                return response.data;
              })
              .catch(response => {
                if (response.status === 403) {
                  return $state.go('forbidden', {
                    nextState: 'record',
                    nextStateParams: Object.assign({}, $stateParams),
                  });
                }
                return $state.go('notFound', { path: '404' });
              });
          },
        },
      },
    },
  ];
}

export default ($transitions, routerHelper) => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

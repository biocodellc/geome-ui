function getStates() {
  return [
    {
      state: 'record',
      config: {
        parent: 'containerPageView',
        url: '/record/*bcid',
        component: 'fimsRecord',
        resolve: {
          record: /* @ngInject */ (RecordService, $stateParams, $state) =>
            RecordService.get($stateParams.bcid)
              .then(response => {
                if (response.status === 204) {
                  $state.go('notFound', { path: '404' });
                }

                return response.data;
              })
              .catch(() => $state.go('notFound', { path: '404' })),
        },
      },
    },
  ];
}

export default ($transitions, routerHelper) => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

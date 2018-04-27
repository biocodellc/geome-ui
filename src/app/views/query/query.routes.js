import { QueryBuilder } from './Query';

function getStates() {
  return [
    {
      state: 'query',
      config: {
        url: '/',
        component: 'fimsQuery',
        resolve: {
          layout: () => 'column',
          layoutFill: () => '',
        },
      },
    },

    // TODO: move this to a separate component?
    {
      state: 'sample',
      config: {
        parent: 'containerPageView',
        url: '/record/*bcid',
        component: 'fimsQueryDetail',
        resolve: {
          sample: /* @ngInject */ (RecordService, $stateParams, $state) =>
            RecordService.get($stateParams.bcid)
              .then(response => {
                if (response.status === 204) {
                  $state.go('notFound', { path: '404' });
                }

                return response.data;
              })
              .catch(() =>
                // exception.catcher("Failed to load sample detail")(response);
                $state.go('notFound', { path: '404' }),
              ),
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

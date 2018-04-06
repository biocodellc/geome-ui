import { QueryBuilder } from './Query';

function getStates() {
  return [
    {
      state: 'query',
      config: {
        // parent: 'fullPageView',
        url: '/query',
        component: 'fimsQuery',
        resolve: {
          layout: () => 'column',
          layoutFill: () => '',
        },
        // projectRequired: true,
        // resolve: {
        //   expeditions: /* @ngInject */ (ProjectService, ExpeditionService) =>
        //     ExpeditionService.all(ProjectService.currentProject().projectId),
        //   markers: /* @ngInject */ ProjectService =>
        //     ProjectService.currentProject().config.getList('markers') || [],
        //   filterOptions: /* @ngInject */ ProjectService => [], // TODO: implement me
        // },
      },
    },

    // TODO: move this to a separate component?
    {
      state: 'sample',
      config: {
        url: '/{entity}/*bcid',
        component: 'fimsQueryDetail',
        resolve: {
          sample: /* @ngInject */ (
            ProjectService,
            QueryService,
            $stateParams,
            $state,
          ) => {
            const builder = new QueryBuilder();
            builder.add(`bcid:"${$stateParams.bcid}"`);

            return QueryService.queryJson(
              builder.build(),
              ProjectService.currentProject().projectId,
              $stateParams.entity,
              0,
              1,
            )
              .then(response => {
                if (response.data.length === 0) {
                  throw new Error(response);
                }

                return response.data[0];
              })
              .catch(() =>
                // exception.catcher("Failed to load sample detail")(response);
                $state.go('notFound', { path: '404' }),
              );
          },
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

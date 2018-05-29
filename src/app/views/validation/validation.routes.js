import angular from 'angular';

function getStates() {
  return [
    {
      state: 'validate',
      config: {
        parent: 'projectView',
        url: '/validate',
        component: 'fimsValidation',
        projectRequired: true,
        resolve: {
          userExpeditions: /* @ngInject */ (
            ExpeditionService,
            ProjectService,
            UserService,
          ) => {
            if (ProjectService.currentProject()) {
              let fetchExpeditions;
              if (UserService.currentUser()) {
                fetchExpeditions = ExpeditionService.getExpeditionsForUser(
                  ProjectService.currentProject().projectId,
                  true,
                );
              } else {
                fetchExpeditions = ExpeditionService.all(
                  ProjectService.currentProject().projectId,
                );
              }

              return fetchExpeditions
                .then(({ data }) => data)
                .catch(() => angular.toaster.error('Failed to load datasets'));
            }

            return [];
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

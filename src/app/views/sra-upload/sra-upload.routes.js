import angular from 'angular';

function getStates() {
  return [
    {
      state: 'sra-upload',
      config: {
        parent: 'projectView',
        url: '/upload/sra',
        component: 'fimsSRAUpload',
        projectRequired: true,
        loginRequired: true,
        resolve: {
          userExpeditions: /* @ngInject */ (
            ExpeditionService,
            ProjectService,
            UserService,
          ) => {
            // TODO only get expeditions with Fastq data
            if (ProjectService.currentProject()) {
              let fetchExpeditions;
              if (UserService.currentUser()) {
                fetchExpeditions = ProjectService.currentProject()
                  .enforceExpeditionAccess
                  ? ExpeditionService.getExpeditionsForUser(
                      ProjectService.currentProject().projectId,
                      true,
                    )
                  : ExpeditionService.all(
                      ProjectService.currentProject().projectId,
                    );
              } else {
                fetchExpeditions = ExpeditionService.all(
                  ProjectService.currentProject().projectId,
                );
              }

              return fetchExpeditions
                .then(({ data }) => data)
                .catch(() =>
                  angular.toaster.error('Failed to load expeditions'),
                );
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

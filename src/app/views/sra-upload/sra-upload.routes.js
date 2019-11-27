import angular from 'angular';

function getStates() {
  return [
    {
      state: 'sra-upload',
      config: {
        parent: 'projectView',
        url: '/upload/sra',
        component: 'fimsSraUpload',
        projectRequired: true,
        loginRequired: true,
        resolve: {
          userExpeditions: /* @ngInject */ (
            ExpeditionService,
            ProjectService,
          ) => {
            const expeditions = ExpeditionService.getExpeditionsForUser(
              ProjectService.currentProject().projectId,
              true,
            );

            const expeditionStats = ExpeditionService.stats(
              ProjectService.currentProject().projectId,
            );

            return Promise.all([
              expeditions.then(({ data }) => data),
              expeditionStats.then(({ data }) => data),
            ])
              .then(([expeditions, stats]) => {
                const expeditionCodesWithFastq = stats
                  .filter(e => parseInt(e.fastqMetadataCount) > 0)
                  .map(e => e.expeditionCode);

                return expeditions.filter(e =>
                  expeditionCodesWithFastq.includes(e.expeditionCode),
                );
              })
              .catch(() => angular.toaster.error('Failed to load expeditions'));
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

import angular from 'angular';

function getStates() {
  return [
    {
      state: 'plates',
      config: {
        parent: 'projectView',
        url: '/plates',
        component: 'fimsPlateViewer',
        projectRequired: true,
        resolve: {
          // userExpeditions: /* @ngInject */ (
          // ExpeditionService,
          // ProjectService,
          // UserService,
          // ) => {
          // if (ProjectService.currentProject()) {
          // let fetchExpeditions;
          // if (UserService.currentUser()) {
          // fetchExpeditions = ExpeditionService.getExpeditionsForUser(
          // ProjectService.currentProject().projectId,
          // true,
          // );
          // } else {
          // fetchExpeditions = ExpeditionService.all(
          // ProjectService.currentProject().projectId,
          // );
          // }
          //
          // return fetchExpeditions
          // .then(({ data }) => data)
          // .catch(() =>
          // angular.toaster.error('Failed to load expeditions'),
          // );
          // }
          //
          // return [];
          // },
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

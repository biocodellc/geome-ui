import angular from 'angular';

function getStates() {
  return [
    {
      state: 'create-project',
      config: {
        parent: 'containerPageView',
        url: '/project/new',
        component: 'fimsCreateProject',
        loginRequired: true,
        resolve: {
          configurations: /* @ngInject */ ProjectConfigurationService =>
            ProjectConfigurationService.all(true, true),
          isNetworkAdmin: /* @ngInject */ (UserService, NetworkService) =>
            NetworkService.get()
              .then(
                network =>
                  network.user.userId === UserService.currentUser().userId,
              )
              .catch(r => {
                angular.catcher('Failed to load network')(r);
                return false;
              }),
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'projectView',
      config: {
        url: '/workbench',
        abstract: true,
        projectRequired: true,
        views: {
          projectView: {
            template:
              '<ui-view layout="column" ng-cloak current-project="$ctrl.currentProject" current-user="$ctrl.currentUser"/>',
          },
        },
      },
    },
    {
      state: 'containerPageView',
      config: {
        component: 'fimsContainerPage',
        abstract: true,
        resolve: {
          layout: () => 'row',
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

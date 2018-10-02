function getStates() {
  return [
    {
      state: 'projectView',
      config: {
        url: '/workbench',
        abstract: true,
        views: {
          projectView: {
            template:
              '<ui-view layout="column" class="layout-fill" ng-cloak current-project="$ctrl.currentProject" current-user="$ctrl.currentUser"/>',
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

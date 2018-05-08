function getStates() {
  return [
    {
      state: 'projectView',
      config: {
        url: '/workbench',
        template:
          '<ui-view layout="column" class="layout-fill" current-project="$ctrl.currentProject" current-user="$ctrl.currentUser"/>',
        abstract: true,
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

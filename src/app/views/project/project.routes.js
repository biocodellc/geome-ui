function getStates() {
  return [
    {
      state: 'project',
      config: {
        url: '/project',
        component: 'fimsProject',
        redirectTo: "project.settings",
        resolve: {
          currentProject: /*ngInject*/(Projects) => Projects.currentProject(),
        },
        projectRequired: true,
        loginRequired: true,
      },
    },
  ];
}

export default ($transitions, routerHelper) => {
  'ngInject';
  routerHelper.configureStates(getStates());
};
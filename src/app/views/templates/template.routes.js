function getStates() {
  return [
    {
      state: 'template',
      config: {
        url: "/template",
        component: 'fimsTemplates',
        resolve: {
          currentProject: /*ngInject*/ (ProjectService) => ProjectService.currentProject(),
          currentUser: /*ngInject*/ (UserService) => UserService.currentUser,
        },
        projectRequired: true,
      },
    },
  ];
}

export default (routerHelper) => {
  'ngInject';
  routerHelper.configureStates(getStates());
};


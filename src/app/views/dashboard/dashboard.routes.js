function getStates() {
  return [
    {
      state: 'dashboard',
      config: {
        parent: 'projectView',
        url: '/dashboard',
        component: 'fimsDashboard',
        projectRequired: false,

        resolve: {
          user: /* @ngInject */ (UserService, $state) =>
            UserService.currentUser()
              ? $state.go('dashboard.myProjects')
              : $state.go('dashboard.publicProjects'),
        },
      },
    },

    {
      state: 'dashboard.myProjects',
      config: {
        url: '/myProjects',
        views: {
          myProjects: {
            component: 'fimsDashboardMyProjects',
          },
        },
      },
    },

    {
      state: 'dashboard.publicProjects',
      config: {
        url: '/publicProjects',
        views: {
          publicProjects: {
            component: 'fimsDashboardPublicProjects',
          },
        },
      },
    },

    {
      state: 'dashboard.memberProjects',
      config: {
        url: '/memberProjects',
        views: {
          memberProjects: {
            component: 'fimsDashboardMemberProjects',
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

function getStates() {
  return [
    {
      state: 'projectView',
      config: {
        url: '/workbench',
        template:
          '<ui-view current-project="$ctrl.currentProject" current-user="$ctrl.currentUser"/>',
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

  // redirect all legacy route
  routerHelper.redirect('/index.jsp', 'home');
  routerHelper.redirect('/login.jsp', 'login');
  routerHelper.redirect('/validation.jsp', 'validate');
  // forward query params
  routerHelper.redirect(
    '/lookup.jsp',
    /* @ngInject */ ($state, $location) =>
      $state.go('lookup', $location.search()),
  );
  routerHelper.redirect(
    '/query.jsp',
    /* @ngInject */ ($state, $location) =>
      $state.go('query', $location.search()),
  );
  routerHelper.redirect('/reset.jsp', 'reset');
  routerHelper.redirect(
    '/resetPass.jsp',
    /* @ngInject */ ($state, $location) =>
      $state.go('resetPass', $location.search()),
  );
  routerHelper.redirect(
    '/templates.jsp',
    /* @ngInject */ ($state, $location) =>
      $state.go('templates', $location.search()),
  );
  routerHelper.redirect('/secure/bcidCreator.jsp', 'creator');
  routerHelper.redirect('/secure/profile.jsp', 'profile');
  routerHelper.redirect('/secure/projects.jsp', 'projects');
};

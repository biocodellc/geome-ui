function getStates() {
  return [
    // {
    //   state: 'notFound',
    //   config: {
    //     url: '*path',
    //     template: require('partials/page-not-found.html'), //todo move to component
    //   },
    // },
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

// TODO clean up
// .state('validate', {
//   url: "/validate",
//   templateUrl: "app/components/validation/validation.html",
//   controller: "ValidationController as vm",
//   projectRequired: true,
//   loginRequired: true,
// })
// .state('lookup', {
//   url: "/lookup?id",
//   templateUrl: "app/components/lookup/lookup.html",
//   controller: "LookupCtrl as vm",
// })
// .state('lookup.metadata', {
//   url: "/metadata/*ark",
//   templateUrl: "app/components/lookup/lookup.metadata.html",
//   controller: "LookupMetadataCtrl as vm",
// })
// .state('creator', {
//   url: "/bcidCreator",
//   templateUrl: "app/components/creator/bcidCreator.jsp",
//   controller: "CreatorCtrl as vm",
//   loginRequired: true,
// })

const routing = ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $locationProvider) => {

  // make trailing / optional
  $urlMatcherFactoryProvider.strictMode(false);

  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "app/components/home/home.html",
    })
    .state('validate', {
      url: "/validate",
      templateUrl: "app/components/validation/validation.html",
      controller: "ValidationController as vm",
      projectRequired: true,
      loginRequired: true,
    })
    .state('lookup', {
      url: "/lookup?id",
      templateUrl: "app/components/lookup/lookup.html",
      controller: "LookupCtrl as vm",
    })
    .state('lookup.metadata', {
      url: "/metadata/*ark",
      templateUrl: "app/components/lookup/lookup.metadata.html",
      controller: "LookupMetadataCtrl as vm",
    })
    .state('query', {
      url: "/query",
      templateUrl: "app/components/query/query.html",
      controller: "QueryCtrl as queryVm",
      projectRequired: true,
    })
    .state('creator', {
      url: "/bcidCreator",
      templateUrl: "app/components/creator/bcidCreator.jsp",
      controller: "CreatorCtrl as vm",
      loginRequired: true,
    })
    .state('projects', {
      url: "/secure/projects",
      templateUrl: "app/components/projects/projects.html",
      controller: "ProjectCtrl as vm",
      projectRequired: true,
      loginRequired: true,
    })
    .state('notFound', {
      url: '*path',
      templateUrl: "app/partials/page-not-found.html",
    });

  $locationProvider.html5Mode(true);

  // redirect all legacy route
  $urlRouterProvider
    .when('/index.jsp', 'home')
    .when('/login.jsp', 'login')
    .when('/validation.jsp', 'validate')
    .when('/lookup.jsp', [ '$state', '$location', function ($state, $location) {
      // forward query params
      $state.go('lookup', $location.search());
    } ])
    .when('/query.jsp', [ '$state', '$location', function ($state, $location) {
      $state.go('query', $location.search());
    } ])
    .when('/reset.jsp', 'reset')
    .when('/resetPass.jsp', [ '$state', '$location', function ($state, $location) {
      $state.go('template', $location.search());
    } ])
    .when('/templates.jsp', [ '$state', '$location', function ($state, $location) {
      $state.go('template', $location.search());
    } ])
    .when('/secure/bcidCreator.jsp', 'creator')
    .when('/secure/profile.jsp', 'profile')
    .when('/secure/projects.jsp', 'projects')
}

routing.$inject = [ '$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', '$locationProvider' ];

export default routing;

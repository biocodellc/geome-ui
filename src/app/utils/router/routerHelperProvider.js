class RouterHelper {
  constructor($state, $stateProvider, $urlRouterProvider) {
    this._hasOtherwise = false;
    this.$state = $state;
    this.$stateProvider = $stateProvider;
    this.$urlRouterProvider = $urlRouterProvider;
  }

  configureStates(states, otherwisePath) {
    states.forEach(function (state) {
      this.$stateProvider.state(state.state, state.config);
    });
    if (otherwisePath && !this._hasOtherwise) {
      this._hasOtherwise = true;
      this.$urlRouterProvider.otherwise(otherwisePath);
    }
  }

  redirect(path, toState) {
    this.$urlRouterProvider.when(path, toState);
  }

  getStates() {
    return this.$state.get();
  }
}

RouterHelper.$inject = [ '$state', '$stateProvider', '$urlRouterProvider' ];

const routerHelperProvider = ($locationProvider, $urlMatcherFactoryProvider) => {
  this.$get = RouterHelper;

  $locationProvider.html5Mode(true);

  // make trailing / optional
  $urlMatcherFactoryProvider.strictMode(false);
};

routerHelperProvider.$inject = [ '$locationProvider', '$urlMatcherFactoryProvider' ];

export default routerHelperProvider;

class RouterHelper {
  constructor($state, $stateRegistry, $urlRouter) {
    this._hasOtherwise = false;
    this.$state = $state;
    this.$stateRegistry = $stateRegistry;
    this.$urlRouter = $urlRouter;
  }

  configureStates(states, otherwisePath) {
    // TODO flatten state objects
    states.forEach(state =>
      this.$stateRegistry.register(
        Object.assign({ name: state.state }, state.config),
      ),
    );

    if (otherwisePath && !this._hasOtherwise) {
      this._hasOtherwise = true;
      this.$urlRouter.otherwise(otherwisePath);
    }
  }

  redirect(path, toState) {
    this.$urlRouter.when(path, toState);
  }

  getStates() {
    return this.$state.get();
  }
}

function routerHelperProvider($locationProvider, $urlMatcherFactoryProvider) {
  'ngInject';

  this.$get = /* @ngInject */ ($state, $stateRegistry, $urlRouter) =>
    new RouterHelper($state, $stateRegistry, $urlRouter);

  $locationProvider.html5Mode(true);

  // make trailing / optional
  $urlMatcherFactoryProvider.strictMode(false);
}

export default routerHelperProvider;

import angular from 'angular';

export default function run($http, $timeout, $rootScope, $transitions, LoadingModal) {
  'ngInject';

  $http.defaults.headers.common = { 'Fims-App': 'Biscicol-Fims' };

  $rootScope.isEmpty = function (val) {
    return angular.equals({}, val);
  };

  // this will wait for the currentProject & currentUser to be loaded from the session
  // before resolving the first route. This hook is only run on page load/refresh
  const deregister = $transitions.onBefore({}, function (trans) {
    return new Promise((resolve) => {
      const timeoutPromise = $timeout(() => {
        resolve(trans.router.stateService.go('home'));
      }, 5000); // timeout loading after 5 secs

      $rootScope.$on('$appInit', () => {
        $timeout.cancel(timeoutPromise);
        deregister();
        resolve();
      });
    });
  }, { priority: 1000 });

  $transitions.onStart({}, function (trans) {
    if (trans.$to().resolvables.length > 0) {
      LoadingModal.open();
    }
  });

  $transitions.onFinish({}, function () {
    LoadingModal.close();
  });

  $transitions.onError({}, function () {
    LoadingModal.close(true);
  });
}

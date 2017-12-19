import angular from 'angular';

export default function run($http, $rootScope, $transitions, LoadingModal) {
  'ngInject';

  $http.defaults.headers.common = {'Fims-App': 'Biscicol-Fims'};

  $rootScope.isEmpty = function (val) {
    return angular.equals({}, val);
  };

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

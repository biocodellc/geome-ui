import angular from 'angular';

const loadSession = (
  $location,
  AuthService,
  StorageService,
  UserService,
  ProjectService,
) => {
  const projectId = $location.search().projectId;
  const loadUser = () =>
    AuthService.getAccessToken() ? UserService.loadFromSession() : undefined;
  return Promise.all([ProjectService.loadFromSession(projectId), loadUser()]);
};

export default function(
  $http,
  $timeout,
  $rootScope,
  $transitions,
  $location,
  AuthService,
  StorageService,
  UserService,
  ProjectService,
) {
  'ngInject';

  $http.defaults.headers.common = { 'Fims-App': 'Biscicol-Fims' };

  $rootScope.isEmpty = function(val) {
    return angular.equals({}, val);
  };

  // this will wait for the currentProject & currentUser to be loaded from the session
  // before resolving the first route. This hook is only run on page load/refresh
  const deregister = $transitions.onBefore(
    {},
    trans =>
      new Promise(resolve => {
        const timeoutPromise = $timeout(() => {
          deregister();
          resolve(trans.router.stateService.go('about'));
        // }, 5000); // timeout loading after 5 secs
        // TODO: something here breaks navigation when this timeout occurs
        //https://stackoverflow.com/questions/42659302/angular-ui-router-1-0-0rc-transition-superseded-on-a-redirect/44654316#44654316
        }, 10000); // timeout loading after 10 secs

        loadSession(
          $location,
          AuthService,
          StorageService,
          UserService,
          ProjectService,
        ).then(([project, user]) => {
          $timeout.cancel(timeoutPromise);
          deregister();

          console.log(project);
          // deregister before setting project & user b/c setting these will trigger a state
          // reload, and we don't want to run this function again
          ProjectService.setCurrentProject(project);
          UserService.setCurrentUser(user);

          resolve();
        });
      }),
    { priority: 1000 },
  );
}

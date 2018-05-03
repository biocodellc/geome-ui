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

  $http.defaults.headers.common = { 'Fims-App': 'GeOMe-db' };

  // this will wait for the currentProject & currentUser to be loaded from the session
  // before resolving the first route. This hook is only run on page load/refresh
  const deregister = $transitions.onBefore(
    {},
    trans => {
      let hasTimedOut = false;

      return new Promise(resolve => {
        const timeoutPromise = $timeout(() => {
          hasTimedOut = true;
          deregister();
          console.log('loadingSession timed out, redirecting to home page');
          resolve(trans.router.stateService.target('about'));
        }, 10000); // timeout loading after 10 secs

        loadSession(
          $location,
          AuthService,
          StorageService,
          UserService,
          ProjectService,
        ).then(([project, user]) => {
          if (!hasTimedOut) {
            $timeout.cancel(timeoutPromise);
            deregister();
          }

          // deregister before setting project & user b/c setting these will trigger a state
          // reload, and we don't want to run this function again
          ProjectService.setCurrentProject(project);
          UserService.setCurrentUser(user);

          if (!hasTimedOut) resolve();
        });
      });
    },
    { priority: 1000 },
  );
}

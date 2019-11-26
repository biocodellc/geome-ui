import angular from 'angular';
import { executeIfTransitionValid } from './utils/router';
import { checkProjectRequired } from './views/project/projectRequired.hook';
import { checkLoginRequired } from './components/auth/loginRequired.hook';

export default function(
  $http,
  $timeout,
  $animate,
  $transitions,
  $state,
  $location,
  AuthService,
  UserService,
  ProjectService,
) {
  'ngInject';

  $http.defaults.headers.common = { 'Fims-App': 'GeOMe-db' };

  const transErrorHandler = $state.defaultErrorHandler();
  $state.defaultErrorHandler(err => {
    console.log('transition error', err);
    if (err && err.message.includes('transition has been superseded')) return;
    transErrorHandler(err);
  });

  $transitions.onBefore({}, () => {
    // disable animations on transitions.
    // seems to be a bug where ui-router will display 2 views
    // (current & next) during a transition while ngAnimate is
    // used.
    $animate.enabled(false);
  });

  // this will wait for the currentProject & currentUser to be loaded from the session
  // before resolving the first route. This hook is only run on page load/refresh
  const deregister = $transitions.onBefore(
    {},
    trans => {
      // immediately deregister so this is only run 1x
      deregister();

      let hasTimedOut = false;
      const projectRequired = checkProjectRequired(trans.$to());
      const loginRequired = checkLoginRequired(trans.$to());

      return new Promise(async resolve => {
        const timeoutPromise = $timeout(() => {
          hasTimedOut = true;
          if (loginRequired || projectRequired) {
            console.log('loadingSession timed out, redirecting to home page');
            resolve(trans.router.stateService.target('home'));
          } else {
            resolve();
          }
          angular.toaster('Timed out loading session');
        }, 10000); // timeout loading after 10 secs

        const projectId = parseInt($location.search().projectId, 10);

        const projectPromise = ProjectService.loadFromSession(projectId).then(
          project => ProjectService.setCurrentProject(project, true, false),
        );
        const userPromise = AuthService.getAccessToken()
          ? UserService.loadFromSession().then(user =>
              UserService.setCurrentUser(user, true),
            )
          : undefined;

        const promisesToWaitFor = projectRequired ? [projectPromise] : [];
        if (loginRequired) promisesToWaitFor.push(userPromise);

        await Promise.all(promisesToWaitFor);
        if (!hasTimedOut) {
          $timeout.cancel(timeoutPromise);
          executeIfTransitionValid(trans, $transitions, () => {
            resolve();
          });
        }
      });
    },
    { priority: 1000 },
  );
}

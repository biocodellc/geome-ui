import { executeIfTransitionValid } from '../../utils/router';

export default ($transitions, UserService, ProjectService) => {
  'ngInject';

  // We reload the state if the currentProject has changed.
  // check that the currentUser is the admin of the project
  // if not, redirect
  $transitions.onBefore({ to: 'project.**' }, trans =>
    Promise.all([UserService.currentUser(), ProjectService.currentProject()])
      .then(([user, project]) => {
        if (user.userId !== project.user.userId) {
          return executeIfTransitionValid(trans, $transitions, () =>
            trans.router.stateService.target('home'),
          );
        }
      })
      .catch(() =>
        executeIfTransitionValid(trans, $transitions, () =>
          trans.router.stateService.target('home'),
        ),
      ),
  );
};

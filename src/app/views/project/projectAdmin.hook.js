export default ($transitions, UserService, Projects) => {
  'ngInject';

  // We reload the state if the currentProject has changed.
  // check that the currentUser is the admin of the project
  // if not, redirect
  $transitions.onBefore({ to: 'project.**' }, (trans) =>
    Promise.all([ UserService.waitForUser(), Projects.waitForProject() ])
      .then(([ user, project ]) => {
        if (user.userId !== project.user.userId) {
          return trans.router.stateService.target('home');
        }
      })
      .catch(() => trans.router.stateService.target('home')),
  );
}

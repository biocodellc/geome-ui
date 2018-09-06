export default ($transitions, ExpeditionService, ProjectService) => {
  'ngInject';

  // We reload the state if the currentProject has changed.
  // check that the currentUser has any expeditions if not, redirect

  $transitions.onBefore({ to: 'expeditions.list' }, trans =>
   ExpeditionService.getExpeditionsForUser(ProjectService.currentProject().projectId, true)
    .then(({data}) => {
      if (data.length <= 0) {
          return trans.router.stateService.target('dashboard');
      }
      })
      .catch(() => trans.router.stateService.target('home')), 
  );
};

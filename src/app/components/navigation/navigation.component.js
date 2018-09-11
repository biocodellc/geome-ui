const template = require('./navigation.html');

class NavigationController {
  constructor($state, $transitions, ExpeditionService) {
    'ngInject';

    this.$state = $state;
    this.$transitions = $transitions;
    this.ExpeditionService = ExpeditionService;
  }

  $onChanges(changesObj) {
    if (
      this.currentUser &&
      this.currentProject &&
      'currentProject' in changesObj
    ) {
      this.ExpeditionService.getExpeditionsForUser(
        this.currentProject.projectId,
        true,
      )
        .then(({ data }) => {
          this.data = data;
        })
        .then(() => {
          if (
            this.data.length <= 0 &&
            this.$state.current.name === 'expeditions.list'
          ) {
            this.$state.go('dashboard');
          }
        });
    }
  }
}

export default {
  template,
  controller: NavigationController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};

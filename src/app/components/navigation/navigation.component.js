const template = require('./navigation.html');

class NavigationController {
  constructor($state, ExpeditionService, $transitions) {
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
      ).then(({ data }) => {
        this.data = data;
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

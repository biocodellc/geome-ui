const template = require('./navigation.html');

class NavigationController {
  constructor($state, ExpeditionService) {
    'ngInject';

    this.$state = $state;
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
        this.showMyExpeditions = false;
        if (this.data.length > 0) {
          this.showMyExpeditions = true;
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

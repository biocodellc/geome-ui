const template = require('./create-project.html');

class CreateProjectController {
  constructor($state, $mdDialog) {
    'ngInject';

    this.$state = $state;
    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.project = {};
    this.newConfig = false;
  }
}

export default {
  template,
  controller: CreateProjectController,
  bindings: {
    currentUser: '<',
    existingProjects: '<',
  },
};

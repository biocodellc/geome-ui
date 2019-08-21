/* eslint-disable no-return-assign */
const template = require('./dashboard.html');

class DashboardController {
  constructor($state, ProjectService) {
    'ngInject';

    this.ProjectService = ProjectService;
    this.$state = $state;
  }
}

export default {
  template,
  controller: DashboardController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};

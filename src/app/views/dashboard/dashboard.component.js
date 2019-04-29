/* eslint-disable no-return-assign */
const template = require('./dashboard.html');
const projectsAndTheirEntityCounts = require('./data.json');

class DashboardController {
  constructor($state, ProjectService /* ExpeditionService */) {
    'ngInject';

    this.ProjectService = ProjectService;
    // this.ExpeditionService = ExpeditionService;
    this.$state = $state;
  }

  $onInit() {
    this.loading = true;

    this.projectsAndTheirEntityCounts = projectsAndTheirEntityCounts;

    this.entities = [
      'Samples',
      'Events',
      'Tissues',
      'EventPhotos',
      'FastaSequence',
      'FastqMetadata',
    ];

    this.ProjectService.all(true)
      .then(({ data }) => {
        this.projects = data;
        this.allProjectIds = data.map(p => p.projectId);
      })
      .finally(() => (this.loading = false));
  }

  showExpeditionsDetail(project) {
    this.loading = true;

    this.ProjectService.setCurrentProject(project) // this does not work unless we use $ctrl.projects in the data table, and will have to change depending on how the new service call is written
      .then(() => this.$state.go('dashboardExpedition'))
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: DashboardController,
  bindings: {
    currentUser: '<',
  },
};

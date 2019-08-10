/* eslint-disable no-return-assign */
const template = require('./dashboard.html');

class DashboardController {
  constructor($state, ProjectService) {
    'ngInject';

    this.ProjectService = ProjectService;
    this.$state = $state;
  }

  $onInit() {
    this.loading = true;
    //    this.ProjectService.setCurrentProject(); // to instantiate without project selected

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
    // needs catch
  }

  showExpeditionsDetail(project) {
    this.loading = true;

    this.ProjectService.setCurrentProject(project)
      .then(() => this.$state.go('overview'))
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

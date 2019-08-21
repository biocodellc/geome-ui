/* eslint-disable no-return-assign */
const template = require('./member-projects.html');

class PublicProjectsController {
  constructor(ProjectService, $state) {
    'ngInject';

    this.ProjectService = ProjectService;
    this.$state = $state;
  }

  $onInit() {
    this.loading = true;
    this.shownProjects = [];
    this.showPublicProjects = true;
    this.ProjectService.all(true).then(({ data }) => (this.allProjects = data));
    this.ProjectService.stats(true)
      .then(({ data }) => (this.allStats = data))
      .finally(() => (this.loading = false));
  }

  showHideProject(project) {
    if (this.shownProjects.includes(project)) {
      const i = this.shownProjects.indexOf(project);
      this.shownProjects.splice(i, 1);
    } else {
      this.shownProjects.push(project);
    }
  }

  showExpeditionsDetail(projectId) {
    this.loading = true;
    const project = this.allProjects.find(p => p.projectId === projectId);
    this.ProjectService.setCurrentProject(project)
      .then(() => this.$state.go('overview'))
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: PublicProjectsController,
  bindings: {
    currentUser: '<',
  },
};

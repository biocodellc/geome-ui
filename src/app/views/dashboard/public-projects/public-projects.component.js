/* eslint-disable no-return-assign */
const template = require('./public-projects.html');

class PublicProjectsController {
  constructor(ProjectService, $state) {
    'ngInject';

    this.ProjectService = ProjectService;
    this.$state = $state;
  }

  $onInit() {
    this.loading = true;
    this.selectedProject = this.currentProject
      ? [this.currentProject.projectTitle]
      : [];
    this.ProjectService.all(true).then(({ data }) => (this.allProjects = data));
    this.ProjectService.stats(true)
      .then(
        ({ data }) => (this.publicStats = data.filter(p => p.public === true)),
      )
      .then(() => (this.filteredProjects = this.publicStats))
      .finally(() => (this.loading = false));
  }

  showHideProject(project) {
    if (this.selectedProject.includes(project.projectTitle))
      this.selectedProject = [];
    else {
      this.selectedProject = [];
      this.ProjectService.setCurrentProject(project, true);
      this.selectedProject.push(project.projectTitle);
    }
  }

  showExpeditionsDetail(projectId) {
    this.loading = true;
    const project = this.allProjects.find(p => p.projectId === projectId);
    this.ProjectService.setCurrentProject(project)
      .then(() => this.$state.go('overview'))
      .finally(() => (this.loading = false));
  }

  searchTextChange(searchText) {
    if (searchText === '') {
      this.filteredProjects = this.publicStats;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredProjects = this.publicStats.filter(
      p => p.projectTitle.toLowerCase().indexOf(sText) > -1,
    );
  }
}

export default {
  template,
  controller: PublicProjectsController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};

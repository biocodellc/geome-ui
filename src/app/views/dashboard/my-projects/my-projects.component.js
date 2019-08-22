/* eslint-disable no-return-assign */
const template = require('./my-projects.html');

class MyProjectsController {
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
    if (this.currentUser) {
      this.ProjectService.stats(false)
        .then(
          ({ data }) =>
            (this.usersStats = data.filter(
              p => p.user.username === this.currentUser.username,
            )),
        )
        .then(() => (this.filteredProjects = this.usersStats))
        .finally(() => (this.loading = false));
    } else {
      this.loading = false;
    }
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
      this.filteredProjects = this.usersStats;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredProjects = this.usersStats.filter(
      p => p.projectTitle.toLowerCase().indexOf(sText) > -1,
    );
  }
}

export default {
  template,
  controller: MyProjectsController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};

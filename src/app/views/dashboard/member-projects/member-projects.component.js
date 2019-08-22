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
    this.selectedProject = this.currentProject
      ? [this.currentProject.projectTitle]
      : [];
    this.showPublicProjects = true;
    const memberProjectTitles = [];
    this.ProjectService.all(false)
      .then(({ data }) => {
        this.allProjects = data;
        data.forEach(p => memberProjectTitles.push(p.projectTitle));
      })
      .then(() =>
        this.ProjectService.stats(true).then(
          ({ data }) =>
            (this.memberStats = data.filter(
              p =>
                memberProjectTitles.includes(p.projectTitle) &&
                p.user.username !== this.currentUser.username,
            )),
        ),
      )
      .then(() => (this.filteredProjects = this.memberStats))
      .finally(() => (this.loading = false));
  }

  showHideProject(project) {
    this.selectedProject = [];
    this.ProjectService.setCurrentProject(project, true);
    this.selectedProject.push(project.projectTitle);
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
      this.filteredProjects = this.memberStats;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredProjects = this.memberStats.filter(
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

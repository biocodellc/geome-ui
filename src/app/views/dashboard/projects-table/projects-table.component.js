const template = require('./projects-table.html');

class ProjectsTableController {
  constructor($state, ProjectService) {
    'ngInject';

    this.$state = $state;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.filteredProjects = this.projects;
  }

  searchTextChange(searchText) {
    if (searchText === '') {
      this.filteredProjects = this.projects;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredProjects = this.projects.filter(
      p => p.projectTitle.toLowerCase().indexOf(sText) > -1,
    );
  }

  goToOverview(project, view) {
    this.loading = true;
    this.ProjectService.setCurrentProject(project, true)
      .then(() => this.$state.go(`${view}-overview`))
      .finally(() => {
        this.loading = false;
      });
  }
}

export default {
  template,
  controller: ProjectsTableController,
  bindings: {
    currentUser: '<',
    projects: '<',
    tableTitle: '<',
  },
};

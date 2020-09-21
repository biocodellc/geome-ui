const template = require('./projects-table.html');

class ProjectsTableController {
  constructor($state, ProjectService) {
    'ngInject';

    this.$state = $state;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.projects.forEach(p => {
      if (p.latestDataModification === null) p.latestDataModification = {};
    });
    this.filteredProjects = this.projects;
    this.orderBy = '-latestDataModification';
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
    let newCurrentProject = project;
    if (!project.public && view === 'team') {
      const { id } = project.projectConfiguration;
      newCurrentProject = this.projects.find(
        p => p.projectConfiguration.id === id && p.public === true,
      );
    }
    this.ProjectService.setCurrentProject(newCurrentProject, true)
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

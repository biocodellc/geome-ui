const template = require('./teams-list.html');

class TeamsListController {
  constructor($state, ProjectConfigurationService) {
    'ngInject';

    this.ProjectConfigurationService = ProjectConfigurationService;
    this.$state = $state;
  }

  $onInit() {
    this.loading = true;

    this.ProjectConfigurationService.all(true)
      .then(data => {
        this.teams = data;
        this.filteredTeams = this.teams;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  searchTextChange(searchText) {
    if (searchText === '') {
      this.filteredTeams = this.teams;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredTeams = this.teams.filter(
      p => p.projectTitle.toLowerCase().indexOf(sText) > -1,
    );
  }

  viewTeamOverview(projectId) {
    this.loading = true;
    const project = this.allProjects.find(p => p.projectId === projectId);
    this.ProjectService.setCurrentProject(project, true)
      .then(() => this.$state.go('team-overview'))
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: TeamsListController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};

const template = require('./teams-list.html');

class TeamsListController {
  constructor(
    $state,
    ProjectService,
    ProjectConfigurationService,
    NetworkConfigurationService,
  ) {
    'ngInject';

    this.ProjectConfigurationService = ProjectConfigurationService;
    this.NetworkConfigurationService = NetworkConfigurationService;
    this.ProjectService = ProjectService;
    this.$state = $state;
  }
  // what we need: number of samples
  // number of members
  // number of projects

  $onInit() {
    this.teams = [];
    this.loading = true;
    this.ProjectService.all(true).then(({ data }) => {
      this.allProjects = data;
    });
    this.ProjectConfigurationService.all(true)
      .then(configs => {
        configs.forEach(c => {
          const configId = c.id;
          this.ProjectConfigurationService.get(configId).then(
            config => this.teams.push(config),
            (this.filteredTeams = this.teams),
          );
        });
      })
      .then(() =>
        this.ProjectService.stats(true).then(data => {
          this.tallyStats(data);
        }),
      )
      .finally(() => {
        this.loading = false;
      });
  }

  tallyStats(stats) {
    /*  const networkApprovedStats = stats.data.filter(
      project => project.projectConfiguration.networkApproved === true,
    );
    this.teams.forEach(team =>
      networkApprovedStats.forEach(p => {
        if (p.projectConfiguration.id === team.id)
          Object.assign(
            { team },
            {
              projects: {
                id: p.projectId,
                stats: p.entityStats,
              },
            },
          );
      }),
    ); */
  }

  searchTextChange(searchText) {
    if (searchText === '') {
      this.filteredTeams = this.teams;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredTeams = this.teams.filter(
      t => t.name.toLowerCase().indexOf(sText) > -1,
    );
  }

  // TODO: come up with better solution for
  // viewing team overview without needing to change
  // the current project
  // or change to a project that
  // will be easier for the user to grasp why the current project
  // was just changed to

  viewTeamOverview(Id) {
    this.loading = true;
    const project = this.allProjects.find(
      p => p.projectConfiguration.id === Id,
    );
    if (this.currentProject.projectConfiguration.id === Id)
      this.$state.go('team-overview');
    else
      this.ProjectService.setCurrentProject(project, true).then(() =>
        this.$state.go('team-overview'),
      );
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

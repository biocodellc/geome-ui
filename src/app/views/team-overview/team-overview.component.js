const template = require('./team-overview.html');

class TeamOverviewController {
  constructor(
    $state,
    ProjectService,
    ProjectConfigurationService,
    NetworkConfigurationService,
    $mdMedia,
  ) {
    'ngInject';

    this.$state = $state;
    this.ProjectService = ProjectService;
    this.ProjectConfigurationService = ProjectConfigurationService;
    this.NetworkConfigurationService = NetworkConfigurationService;
    this.$mdMedia = $mdMedia;
  }

  $onInit() {
    if (this.currentProject.limitedAccess) return;
    this.loading = true;
    this.config = this.currentProject.config;
    this.sampleEntityIndex = this.config.entities.findIndex(
      e => e.conceptAlias === 'Sample',
    );
    this.configuration = this.currentProject.projectConfiguration;
    this.textTruncated = true;
    this.getTeamDetails();
    this.getProjectStats();
  }

  $onChanges(changesObj) {
    if (
      'currentProject' in changesObj &&
      this.currentProject.projectConfiguration.networkApproved !== true
    )
      this.$state.go('project-overview');
  }

  getTeamDetails() {
    this.teamDetails = {
      'Team Administrator': this.currentProject.projectConfiguration.user
        .username,
      Contact: this.currentProject.projectConfiguration.user.email,
      // TODO: Include real variables after the API is updated
      DOI: undefined,
      Website: undefined,
      Documentation: undefined,
    };
  }

  getProjectStats() {
    this.ProjectService.stats(true)
      .then(({ data }) => {
        this.projectStats = data;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  viewProjectOverview(project) {
    this.loading = true;
    this.ProjectService.setCurrentProject(project, true)
      .then(() => this.$state.go('project-overview'))
      .finally(() => {
        this.loading = false;
      });
  }
}

export default {
  template,
  controller: TeamOverviewController,
  bindings: {
    currentProject: '<',
  },
};

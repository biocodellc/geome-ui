const template = require('./team-overview.html');

class TeamOverviewController {
  constructor(
    $state,
    $location,
    ProjectService,
    ProjectConfigurationService,
    NetworkConfigurationService,
    $mdMedia,
  ) {
    'ngInject';

    this.$state = $state;
    this.$location = $location;
    this.ProjectService = ProjectService;
    this.ProjectConfigurationService = ProjectConfigurationService;
    this.NetworkConfigurationService = NetworkConfigurationService;
    this.$mdMedia = $mdMedia;
  }

  $onInit() {
    this.url =  this.$location.absUrl().split('?')[0];
    this.teamUrl = this.url + "?teamId=" + this.currentProject.projectConfiguration.id;
    //this.administrator = this.currentProject.projectConfiguration.user.username;
    this.administrator = this.currentProject.projectConfiguration.user.first_name + " " +  this.currentProject.projectConfiguration.user.last_name;
    this.contact = this.currentProject.projectConfiguration.user.email;

    if (this.currentProject.limitedAccess) return;
    this.loading = true;
    this.config = this.currentProject.config;
    this.sampleEntityIndex = this.config.entities.findIndex(
      e => e.conceptAlias === 'Sample',
    );
    this.configuration = this.currentProject.projectConfiguration;
    this.textTruncated = true;
    //this.getTeamDetails();
    this.getProjectStats();
  }

  $onChanges(changesObj) {
    if (
      'currentProject' in changesObj &&
      this.currentProject.projectConfiguration.networkApproved !== true
    )
      this.$state.go('project-overview');
  }

  /*
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
    */

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

import angular from 'angular';
import ProjectConfig from '../../models/ProjectConfig';

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
    this.loading = true;
    this.config = this.currentProject.config;
    this.sampleEntityIndex = this.config.entities.findIndex(
      e => e.conceptAlias === 'Sample',
    );
    this.configuration = this.currentProject.projectConfiguration;
    this.textTruncated = true;
    this.getTeamDetails();
    this.getProjectStats();
    // this.getNetworkConfiguration();
    // this.initializeCollaborationLabel();
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
      .finally(() => (this.loading = false));
  }

  /* getNetworkConfiguration() {
    this.NetworkConfigurationService.get()
      .then(config => {
        this.networkConfig = config;
      })
      .finally(() => this.getTKAttributeObject());
  } */

  /* getTKAttributeObject() {
    const index = this.networkConfig.entities.findIndex(
      e => e.conceptAlias === 'Sample',
    );
    const allSampleAttributes = this.networkConfig.entities[index].attributes;
    this.TKAttributeObject = allSampleAttributes.find(
      a => a.column === 'traditionalKnowledgeNotice',
    );
  } */

  /* initializeCollaborationLabel() {
    this.openToCollaboration = this.config.entities[
      this.sampleEntityIndex
    ].attributes.some(
      attribute => attribute.column === 'traditionalKnowledgeNotice',
    );
  } */

  viewProjectOverview(project) {
    this.loading = true;
    this.ProjectService.setCurrentProject(project, true)
      .then(() => this.$state.go('project-overview'))
      .finally(() => (this.loading = false));
  }

  /* updateCollaborationAttribute() {
    const sampleAttributes = this.config.entities[this.sampleEntityIndex]
      .attributes;
    const sampleRules = this.config.entities[this.sampleEntityIndex].rules;
    // ng-model changes before ng-change is executed
    if (this.openToCollaboration === false) {
      const attributeIndex = sampleAttributes.findIndex(
        a => a.column === 'traditionalKnowledgeNotice',
      );
      const ruleIndex = sampleRules.findIndex(
        r => r.column === 'traditionalKnowledgeNotice',
      );
      sampleAttributes.splice(attributeIndex, 1);
      sampleRules.splice(ruleIndex, 1);
    } else sampleAttributes.push(this.TKAttributeObject);

    this.updateProjectConfiguration();
  } */

  /* updateProjectConfiguration() {
    this.loadingCollaborationCheckbox = true;
    return this.ProjectConfigurationService.save(
      Object.assign({}, this.configuration, { config: this.config }),
    )
      .then(configuration => {
        angular.toaster.success('Successfully updated project configuration!');
        this.config = new ProjectConfig(configuration.config);
        this.currentProject.config = new ProjectConfig(configuration.config);
      })
      .catch(() => {
        angular.toaster.error('Error saving project configuration!');
      })
      .finally(() => {
        this.loadingCollaborationCheckbox = false;
      });
  } */
}

export default {
  template,
  controller: TeamOverviewController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};

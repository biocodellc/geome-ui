import angular from 'angular';
import ProjectConfig from '../../models/ProjectConfig';
import Rule from '../../models/Rule';

const template = require('./create-project.html');

class CreateProjectController {
  constructor(
    $state,
    $anchorScroll,
    $location,
    $mdDialog,
    NetworkConfigurationService,
    ProjectConfigurationService,
    ProjectService,
  ) {
    'ngInject';

    this.$state = $state;
    this.$anchorScroll = $anchorScroll;
    this.$location = $location;
    this.$mdDialog = $mdDialog;
    this.NetworkConfigurationService = NetworkConfigurationService;
    this.ProjectConfigurationService = ProjectConfigurationService;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.project = {
      projectTitle: undefined,
      description: undefined,
      public: false,
    };
    this.syncConfig = true;
    this.requiredAttributes = {};
    this.requiredRules = {};
  }

  createProject() {
    if (this.syncConfig) {
      this.project.projectConfiguration = this.existingConfig;
    } else {
      // creating a new ProjectConfiguration
      this.project.projectConfig = this.config;
    }

    this.creatingProject = true;
    this.ProjectService.create(this.project)
      .then(({ data }) => {
        data.config = new ProjectConfig(data.projectConfig);
        delete data.projectConfig;
        return this.ProjectService.setCurrentProject(data);
      })
      .then(() => this.$state.go('validate'))
      .catch(resp => {
        if (resp.status === 400 && resp.data.errors) {
          this.errors = resp.data.errors;
          this.$location.hash('errors');
          this.$anchorScroll();
        }
      })
      .finally(() => {
        this.creatingProject = false;
      });
  }

  updateAttributes(e, attributes) {
    e.attributes = attributes.map(a => Object.assign({}, a));
  }

  updateRules(e, rules) {
    e.rules = rules.map(r => new Rule(angular.copy(r)));
  }

  updateProperties(properties) {
    this.config.expeditionMetadataProperties = properties;
  }

  availableAttributes(conceptAlias) {
    return this.networkConfig.entities.find(
      e => e.conceptAlias === conceptAlias,
    ).attributes;
  }

  isRequiredAttribute(conceptAlias, attribute) {
    return this.requiredAttributes[conceptAlias].includes(attribute);
  }

  resetVisitedSteps($mdStep) {
    if (
      this.configName &&
      this.existingConfig &&
      this.existingConfig.name !== this.configName
    ) {
      $mdStep.$stepper.resetVisitedTo($mdStep.stepNumber);
    }
  }

  async toConfigStep($mdStep) {
    this.fetchNetworkConfig();

    this.loading = true;
    await Promise.all([this.fetchConfig(), this.networkPromise]);
    this.loading = false;

    if (!this.config) return;
    this.setRequiredRules();
    this.setRequiredAttributes(this.config);

    $mdStep.$stepper.next();
  }

  setRequiredAttributes(config) {
    config.entities.forEach(e => {
      this.setEntityRequiredAttributes(e);
    });
  }

  setEntityRequiredAttributes(e) {
    const requiredAttributes = e.worksheet
      ? this.networkConfig.requiredAttributesForEntity(e.conceptAlias)
      : [];

    const ne = this.networkConfig.entities.find(
      entity => entity.conceptAlias === e.conceptAlias,
    );

    const addUniqueKey = entity => {
      const attribute = ne.attributes.find(a => a.column === entity.uniqueKey);
      requiredAttributes.push(attribute);
      if (!e.attributes.find(attr => attribute.uri === attr.uri)) {
        e.attributes.push(attribute);
      }
    };

    if (!requiredAttributes.find(a => a.column === e.uniqueKey)) {
      addUniqueKey(e);
    }

    if (ne.uniqueKey !== e.uniqueKey) {
      const i = requiredAttributes.findIndex(a => a.column === ne.uniqueKey);
      if (i > -1) requiredAttributes.splice(i, 1);
    }

    if (e.parentEntity) {
      const p = (this.config || this.networkConfig).entities.find(
        entity => e.parentEntity === entity.conceptAlias,
      );

      if (!requiredAttributes.find(a => a.column === p.uniqueKey)) {
        addUniqueKey(p);
      }
    }

    this.requiredAttributes[e.conceptAlias] = requiredAttributes;
  }

  setRequiredRules() {
    this.networkConfig.entities.forEach(e => {
      this.setEntityRequiredRules(e);
    });
  }

  setEntityRequiredRules(e) {
    this.requiredRules[e.conceptAlias] = this.networkConfig.entities.find(
      entity => entity.conceptAlias === e.conceptAlias,
    ).rules;

    // if (
    //   !this.requiredRules[e.conceptAlias].find(
    //     r =>
    //       r.name === 'RequiredValue' &&
    //       r.columns.includes(e.uniqueKey) &&
    //       r.level === 'ERROR',
    //   )
    // ) {
    //   this.requiredRules.push(
    //     new Rule({
    //       name: 'RequiredValue',
    //       columns: [],
    //     }),
    //   );
    // }
  }

  fetchConfig() {
    if (!this.existingConfig || this.existingConfig.config) {
      if (this.existingConfig && this.existingConfig.name !== this.configName) {
        this.config = new ProjectConfig(this.existingConfig.config);
      }
      return Promise.resolve();
    }

    return this.ProjectConfigurationService.get(this.existingConfig.id)
      .then(async data => {
        await this.networkPromise;
        this.existingConfig = data;
        this.config = new ProjectConfig(data.config);
        this.configName = this.existingConfig.name;

        const i = this.configurations.findIndex(
          c => c.name === this.existingConfig.name,
        );
        this.configurations.splice(i, 1, this.existingConfig);
      })
      .catch(() =>
        angular.toaster.error(
          'Failed to load the configuration. Please refresh the page and try again',
        ),
      );
  }

  fetchNetworkConfig() {
    this.networkPromise = this.NetworkConfigurationService.get()
      .then(config => {
        this.networkConfig = config;
      })
      .catch(() =>
        angular.toaster.error(
          'Failed to load the network configuration. Please try again later.',
        ),
      );
  }
}

export default {
  template,
  controller: CreateProjectController,
  bindings: {
    currentUser: '<',
    configurations: '<',
  },
};

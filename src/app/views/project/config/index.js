import angular from 'angular';
import routing from "./routes";

import fimsProjectConfigMetadata from './metadata';
import fimsProjectConfigEntities from './entities';

class ConfigController {
  constructor($scope, $state, ProjectConfigService, alerts) {
    'ngInject'
    this.$scope = $scope;
    this.$state = $state;
    this.ProjectConfigService = ProjectConfigService;
    this.alerts = alerts;

  }

  $ngInit() {
    this.addText = undefined;
    this.config = Object.assign({}, this.currentProject.config);

    //TODO remove these watches
    this.$scope.$watch(() => this.$state.current.name, () => (name) => {
      if (name === 'project.config.entities') {
        this.addText = 'Entity';
      } else if (name === 'project.config.lists') {
        this.addText = 'List';
      }
    });

    this.$scope.$watch('vm.config', (newVal, oldVal) => {
      if (!this.config.modified && !angular.equals(newVal, oldVal)) {
        this.config.modified = true;
      }
    }, true);
  }

  add() {
    if (this.$state.current.name === 'project.config.entities') {
      this.$state.go('project.config.entities.add');
    } else {
      // this.$state.go('project.config.lists.add');
    }
  }

  save() {
    this.alerts.removeTmp();
    this.ProjectConfigService.save(this.config, this.currentProject.projectId)
      .then((config) => {
        this.currentProject.config = config;
        this.alerts.success("Successfully updated project configuration!");
      }).catch((response) => {
      if (response.status === 400) {
        response.data.errors.forEach(error => this.alerts.error(error));
      }
    });
  }

}

const fimsProjectConfig = {
  template: require('./config.html'),
  controller: ConfigController,
  bindings: {
    currentProject: '<',
  },
};


const dependencies = [
  fimsProjectConfigMetadata,
  fimsProjectConfigEntities,
];

export default angular.module('fims.projectConfig', dependencies)
  .run(routing)
  .component('fimsProjectConfig', fimsProjectConfig)
  .name;

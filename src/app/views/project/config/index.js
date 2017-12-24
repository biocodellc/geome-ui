import angular from 'angular';

import routing from "./routes";
import fimsProjectConfigMetadata from './metadata';
import fimsProjectConfigEntities from './entities';
import fimsProjectConfigNavbar from './navbar.component';


class ConfigController {
  constructor($scope, $state, $uibModal, ProjectConfigService, alerts) {
    'ngInject'
    this.$scope = $scope;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.ProjectConfigService = ProjectConfigService;
    this.alerts = alerts;
  }

  $onInit() {
    this.showSave = false;
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
    //
    // this.$scope.$watch('vm.config', () => {
    //   this.showSave = !angular.equals(this.currentProject.config, this.config);
    // }, true);
  }

  handleUpdateEntities(entities) {
    this.config.entities = entities;
    this.showSave = !angular.equals(this.currentProject.config, this.config);
  }

  handleNewWorksheet(sheetName) {
    this.config.addWorksheet(sheetName);
    this.showSave = true;
  }

  handleOnAdd() {
    if (this.$state.current.name === 'project.config.entities') {
      this.$state.go('project.config.entities.add');
    } else {
      this.$state.go('project.config.lists.add');
    }
  }

  handleOnSave() {
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
    view: '<',
  },
};


const dependencies = [
  fimsProjectConfigMetadata,
  fimsProjectConfigEntities,
  fimsProjectConfigNavbar
];

export default angular.module('fims.projectConfig', dependencies)
  .run(routing)
  .component('fimsProjectConfig', fimsProjectConfig)
  .name;

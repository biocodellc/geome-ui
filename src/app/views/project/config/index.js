import angular from 'angular';

import routing from "./routes";
import confirmExit from './confirmExit.hook';
import fimsProjectConfigOverview from './config-overview.component';
import ProjectConfig from "./ProjectConfig";


class ConfigController {
  constructor($state, ProjectConfigService, alerts) {
    'ngInject'
    this.$state = $state;
    this.ProjectConfigService = ProjectConfigService;
    this.alerts = alerts;
  }

  $onInit() {
    this.showSave = false;
    this.config = new ProjectConfig(this.currentProject.config);
    this.projectConfigState = this.$state.get('project.config');

    if (!this.projectConfigState.data) {
      this.projectConfigState.data = {};
    }
  }

  updateStateData() {
    if (this.showSave) {
      this.projectConfigState.data.config = this.config;
    } else {
      delete this.projectConfigState.data.config;
    }
  }

  handleUpdateEntities(entities) {
    this.config.entities = entities;
    this.showSave = !angular.equals(this.currentProject.config, this.config);
    this.updateStateData();
  }

  handleUpdateEntity(alias, entity) {
    const i = this.config.entities.findIndex(e => e.conceptAlias === alias);
    this.config.entities.splice(i, 1, entity);
    this.showSave = !angular.equals(this.currentProject.config, this.config);
    this.updateStateData();
  }

  handleUpdateLists(lists) {
    this.config.lists = lists;
    this.showSave = !angular.equals(this.currentProject.config, this.config);
    this.updateStateData();
  }

  handleUpdateList(alias, list) {
    const i = this.config.lists.findIndex(l => l.alias === alias);
    this.config.lists.splice(i, 1, list);
    this.showSave = !angular.equals(this.currentProject.config, this.config);
    this.updateStateData();
  }

  handleUpdateMetadata(config) {
    delete config.entities;
    delete config.lists;
    Object.assign(this.config, config);
    this.showSave = !angular.equals(this.currentProject.config, this.config);
    this.updateStateData();
  }

  handleNewWorksheet(sheetName) {
    this.config.addWorksheet(sheetName);
    this.showSave = true;
    this.updateStateData();
  }

  handleOnSave() {
    this.alerts.removeTmp();
    this.ProjectConfigService.save(this.config, this.currentProject.projectId)
      .then((config) => {
        this.currentProject.config = config;
        this.alerts.success("Successfully updated project configuration!");
        this.updateStateData();
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

export default angular.module('fims.projectConfig', [ fimsProjectConfigOverview ])
  .run(routing)
  .run(confirmExit)
  .component('fimsProjectConfig', fimsProjectConfig)
  .name;

import angular from 'angular';

import routing from "./routes";
import confirmExit from './confirmExit.hook';
import fimsProjectConfigMetadata from './metadata';
import fimsProjectConfigEntities from './entities';
import fimsProjectConfigLists from './lists';
import fimsProjectConfigNavbar from './navbar.component';
import Rule from "./Rule";
import ProjectConfig from "./ProjectConfig";


// TODO abstract out another container so se don't have this weird ui-view thing going on?

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
    this.config = new ProjectConfig(this.currentProject.config);
    this.projectConfigState = this.$state.get('project.config');

    if (!this.projectConfigState.data) {
      this.projectConfigState.data = {};
    }

    //TODO remove these watches
    this.$scope.$watch(() => this.$state.current.name, (name) => {
      switch (name) {
        case 'project.config.entities':
          this.addText = 'Entity';
          break;
        case 'project.config.lists':
          this.addText = 'List';
          break;
        default:
          this.addText = undefined;
      }
    });
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
        this.updateStateData();
      }).catch((response) => {
      if (response.status === 400) {
        response.data.errors.forEach(error => this.alerts.error(error));
      }
    });
  }

  handleOnAddEntity(entity) {
    if (entity.parentEntity) {
      const rule = Rule.newRule("RequiredValue");
      rule.level = 'ERROR';
      const column = this.config.entityUniqueKey(entity.parentEntity);
      rule.columns.push(column);

      entity.attributes.push({
        column: column,
        datatype: 'STRING',
        group: 'Default',
      });

      entity.rules.push(rule);
    }

    this.config.entities.push(entity);

    this.$state.go('^.detail.attributes', { alias: entity.conceptAlias, entity: entity, addAttribute: true });
  }

  handleOnAddList(list) {
    const lists = this.config.lists.slice();
    lists.push(list);
    this.handleUpdateLists(lists);
    this.$state.go('^.detail', { alias: list.alias, list: list, addField: true });
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
  fimsProjectConfigLists,
  fimsProjectConfigNavbar,
];

export default angular.module('fims.projectConfig', dependencies)
  .run(routing)
  .run(confirmExit)
  .component('fimsProjectConfig', fimsProjectConfig)
  .name;

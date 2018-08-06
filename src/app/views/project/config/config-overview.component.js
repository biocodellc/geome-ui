import angular from 'angular';

import fimsProjectConfigMetadata from './metadata';
import fimsProjectConfigEntities from './entities';
import fimsProjectConfigLists from './lists';
import fimsProjectConfigExpeditionMetadata from './expedition-metadata';
import fimsProjectConfigNavbar from './navbar.component';
import Rule from '../../../models/Rule';

const template = require('./overview.html');

class ConfigOverviewController {
  constructor($scope, $state) {
    'ngInject';

    this.$scope = $scope;
    this.$state = $state;
  }

  $onInit() {
    this.addText = undefined;

    // TODO remove this watch
    this.$scope.$watch(
      () => this.$state.current.name,
      name => {
        switch (name) {
          case 'project.config.entities':
            this.addText = 'Entity';
            break;
          case 'project.config.lists':
            this.addText = 'List';
            break;
          case 'project.config.expeditionMetadata':
            this.addText = 'Property';
            break;
          default:
            this.addText = undefined;
        }
      },
    );
  }

  handleOnAdd() {
    if (this.$state.current.name === 'project.config.entities') {
      this.$state.go('project.config.entities.add');
    } else if (this.$state.current.name === 'project.config.lists') {
      this.$state.go('project.config.lists.add');
    } else {
      // we need to get a new array for ui-router to know to update the binding
      this.config.expeditionMetadataProperties = this.config.expeditionMetadataProperties.concat(
        [
          {
            name: '',
            required: false,
            isNew: true,
          },
        ],
      );
    }
  }

  handleOnAddEntity(entity) {
    if (entity.parentEntity) {
      const rule = Rule.newRule('RequiredValue');
      rule.level = 'ERROR';
      const column = this.config.entityUniqueKey(entity.parentEntity);
      rule.columns.push(column);

      entity.attributes.push({
        column,
        dataType: 'STRING',
        group: 'Default',
      });

      entity.rules.push(rule);
    }

    const entities = this.config.entities.slice();
    entities.push(entity);

    this.onUpdateEntities({ entities });
    this.$state.go('^.detail.attributes', {
      alias: entity.conceptAlias,
      entity,
      addAttribute: true,
    });
  }

  handleOnAddList(list) {
    const lists = this.config.lists.slice();
    lists.push(list);
    this.onUpdateLists({ lists });
    this.$state.go('^.detail', {
      alias: list.alias,
      list,
      addField: true,
    });
  }

  handleOnUpdateExpeditionMetadata(expeditionMetadata) {
    this.config.expeditionMetadata = expeditionMetadata;
    this.onUpdateExpeditionMetadata(expeditionMetadata);
  }
}

const fimsProjectConfigOverview = {
  template,
  controller: ConfigOverviewController,
  bindings: {
    config: '<',
    showSave: '<',
    onSave: '&',
    onUpdateMetadata: '&',
    onUpdateExpeditionMetadata: '&',
    onNewWorksheet: '&',
    onUpdateEntities: '&',
    onUpdateLists: '&',
  },
};

const dependencies = [
  fimsProjectConfigMetadata,
  fimsProjectConfigEntities,
  fimsProjectConfigLists,
  fimsProjectConfigExpeditionMetadata,
  fimsProjectConfigNavbar,
];

export default angular
  .module('fims.projectConfigOverview', dependencies)
  .component('fimsProjectConfigOverview', fimsProjectConfigOverview).name;

import angular from 'angular';

import entityAttributes from './attributes/entity-attributes.component';
import fimsAttribute from './attributes/attribute.component';
import entityRules from './rules/entity-rules.component';


class EntityDetailController {
  constructor($scope, $state, ProjectConfigService, alerts) {
    'ngInject'
    this.$scope = $scope;
    this.$state = $state;
    this.ProjectConfigService = ProjectConfigService;
    this.alerts = alerts;

    $scope.$watch(() => $state.current.name, (name) => {
      if (name === 'project.config.entities.detail.attributes') {
        this.addText = 'Attribute';
      } else if (name === 'project.config.entities.detail.rules') {
        this.addText = 'Rule';
      }
    });

    $scope.$watch('vm.config', (newVal, oldVal) => {
      if (!this.config.modified && !angular.equals(newVal, oldVal)) {
        this.config.modified = true;
      }
    }, true);
  }

  $onInit() {
    this.config = Object.assign({}, this.currentProject.config);
    this.showSave = false;
    this.addText = undefined;

    if (this.$state.params.addAttribute) {
      this.newAttribute();
    }
  }

  handleOnAdd() {
    if (this.$state.current.name === 'project.config.entities.detail.attributes') {
      this.newAttribute();
    } else if (this.$state.current.name === 'project.config.entities.detail.rules') {
      this.$state.go(".add");
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

  handleDeleteAttribute(index) {
    this.entity.attributes.splice(index, 1);
  }

  handleUpdateAttributes(attributes) {
    this.entity.attributes = attributes;

    const oldEntity = this.currentProject.config.entities.find(e => e.conceptAlias === this.entity.conceptAlias);
    this.showSave = !angular.equals(oldEntity, this.entity);
  }

  handleAddRule(rule) {
    const metadata = rule.metadata();
    const invalidMetadata = Object.keys(metadata).map(k =>
      !metadata[ k ] || (Array.isArray(metadata[ k ]) && metadata[ k ].length === 0));

    if (invalidMetadata.length !== 0) {
      const msg = invalidMetadata.length > 1 ? ' are all required' : ' is required';

      this.alerts.error(invalidMetadata.join(', ') + msg);
      return;
    }

    // TODO verify this works
    if (this.entity.rules.includes(rule)) {
      this.alerts.error('That rule already exists.');
      return;
    }

    this.alerts.removeTmp();
    this.entity.rules.push(rule);
    this.$state.go('^');
  }

  newAttribute() {
    this.entity.attributes.push({
      datatype: 'STRING',
      group: 'Default',
      isNew: true,
    });
  }
}

const fimsEntityDetail = {
  template: require('./entity-detail.html'),
  controller: EntityDetailController,
  bindings: {
    entity: '<',
    currentProject: '<',
  },
};

const dependencies = [
  entityAttributes,
  fimsAttribute,
  entityRules,
];

export default angular.module('fims.projectConfigEntityDetail', dependencies)
  .component('fimsEntityDetail', fimsEntityDetail)
  .name;

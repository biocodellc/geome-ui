import angular from 'angular';

import entityAttributes from './attributes/entity-attributes.component';
import fimsAttribute from './attributes/attribute.component';
import entityRules from './rules/entity-rules.component';

const template = require('./entity-detail.html');

class EntityDetailController {
  constructor($scope, $state) {
    'ngInject';

    this.$scope = $scope;
    this.$state = $state;

    $scope.$watch(
      () => $state.current.name,
      name => {
        if (name === 'project.config.entities.detail.attributes') {
          this.addText = 'Attribute';
        } else if (name === 'project.config.entities.detail.rules') {
          this.addText = 'Rule';
        }
      },
    );
  }

  $onInit() {
    this.addText = undefined;
    this.entity = angular.copy(this.entity); // angular.copy performs a deep copy

    if (this.$state.params.addAttribute) {
      this.newAttribute();
    }
  }

  handleOnAdd() {
    if (
      this.$state.current.name === 'project.config.entities.detail.attributes'
    ) {
      this.newAttribute();
    } else if (
      this.$state.current.name === 'project.config.entities.detail.rules'
    ) {
      this.$state.go('.add');
    }
  }

  handleUpdateAttributes(attributes) {
    this.entity.attributes = attributes;
    this.onUpdateEntity({
      alias: this.entity.conceptAlias,
      entity: this.entity,
    });
  }

  handleUpdateRules(rules) {
    this.entity.rules = rules;
    this.onUpdateEntity({
      alias: this.entity.conceptAlias,
      entity: this.entity,
    });
  }

  handleAddRule(rule) {
    const metadata = rule.metadata();
    const invalidMetadata = Object.keys(metadata).filter(
      k =>
        !metadata[k] ||
        (Array.isArray(metadata[k]) && metadata[k].length === 0),
    );

    if (invalidMetadata.length !== 0) {
      const msg =
        invalidMetadata.length > 1 ? ' are all required' : ' is required';

      angular.alerts.error(invalidMetadata.join(', ') + msg);
      return;
    }

    if (this.entity.rules.find(r => angular.equals(r, rule))) {
      angular.alerts.error('That rule already exists.');
      return;
    }

    angular.alerts.removeTmp();
    this.entity.rules.push(rule);
    this.onUpdateEntity({
      alias: this.entity.conceptAlias,
      entity: this.entity,
    });
    this.$state.go('^');
  }

  newAttribute() {
    this.entity.attributes = this.entity.attributes.concat({
      datatype: 'STRING',
      group: 'Default',
      isNew: true,
    });
  }
}

const fimsEntityDetail = {
  template,
  controller: EntityDetailController,
  bindings: {
    config: '<',
    entity: '<',
    addText: '<',
    showSave: '<',
    currentProject: '<',
    onSave: '&',
    onUpdateEntity: '&',
  },
};

const dependencies = [entityAttributes, fimsAttribute, entityRules];

export default angular
  .module('fims.projectConfigEntityDetail', dependencies)
  .component('fimsEntityDetail', fimsEntityDetail).name;

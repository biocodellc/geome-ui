import angular from 'angular';

const template = require('./entity-detail.html');

class EntityDetailController {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }

  $onInit() {
    this.type =
      this.$state.current.name === 'project-config.entities.detail.attributes'
        ? 'attributes'
        : 'rules';
    this.entity = angular.copy(this.entity); // angular.copy performs a deep copy
  }

  requiredAttributes() {
    if (this.cachedRequiredAttributes) return this.cachedRequiredAttributes;

    const requiredAttributes = this.networkConfig.requiredAttributesForEntity(
      this.entity.conceptAlias,
    );

    const ne = this.networkConfig.entities.find(
      entity => entity.conceptAlias === this.entity.conceptAlias,
    );

    const addUniqueKey = entity => {
      const attribute = ne.attributes.find(a => a.column === entity.uniqueKey);
      requiredAttributes.push(attribute);
      if (!this.entity.attributes.find(attr => attribute.uri === attr.uri)) {
        this.entity.attributes.push(attribute);
      }
    };

    if (!requiredAttributes.find(a => a.column === this.entity.uniqueKey)) {
      addUniqueKey(this.entity);
    }

    if (ne.uniqueKey !== this.entity.uniqueKey) {
      const i = requiredAttributes.findIndex(a => a.column === ne.uniqueKey);
      if (i > -1) requiredAttributes.splice(i, 1);
    }

    if (this.entity.parentEntity) {
      const p = (this.config || this.networkConfig).entities.find(
        entity => this.entity.parentEntity === entity.conceptAlias,
      );

      if (!requiredAttributes.find(a => a.column === p.uniqueKey)) {
        addUniqueKey(p);
      }
    }

    this.cachedRequiredAttributes = requiredAttributes;
    return this.cachedRequiredAttributes;
  }

  availableAttributes() {
    return this.networkConfig.entities.find(
      e => e.conceptAlias === this.entity.conceptAlias,
    ).attributes;
  }

  handleUpdateAttributes(attributes) {
    this.entity.attributes = attributes.slice();
    this.onUpdateEntity({
      alias: this.entity.conceptAlias,
      entity: this.entity,
    });
  }

  handleUpdateRules(rules) {
    this.entity.rules = rules;

    // auto set entity.uniqueAcrossProject if we set the rule
    const uniqueKeyUniqueValueRule = rules.find(
      r => r.name === 'UniqueValue' && r.column === this.entity.uniqueKey,
    );
    if (uniqueKeyUniqueValueRule) {
      this.entity.uniqueAcrossProject =
        uniqueKeyUniqueValueRule.uniqueAcrossProject;
    }

    this.onUpdateEntity({
      alias: this.entity.conceptAlias,
      entity: this.entity,
    });
  }
}

const fimsEntityDetail = {
  template,
  controller: EntityDetailController,
  bindings: {
    config: '<',
    entity: '<',
    canEdit: '<',
    networkConfig: '<',
    currentProject: '<',
    onSave: '&',
    onUpdateEntity: '&',
  },
};

export default angular
  .module('fims.projectConfigEntityDetail', [])
  .component('fimsEntityDetail', fimsEntityDetail).name;

import angular from 'angular';

import Rule, { AVAILABLE_RULES } from '../../models/Rule';

const template = require('./project-config-rules.html');
const editTemplate = require('./edit-rule.html');
const addTemplate = require('./add-rule.html');

class ProjectConfigRulesController {
  constructor($filter, $mdDialog) {
    'ngInject';

    this.$filter = $filter;
    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.orderBy = 'level';
  }

  $onChanges(changesObj) {
    if ('rules' in changesObj) {
      this.rules = this.rules.map(r => new Rule(angular.copy(r)));
    }
  }

  isArray(v) {
    return Array.isArray(v);
  }

  handleChange() {
    this.onChange({ rules: this.rules });
  }

  canEditRule(r) {
    if (
      r.name === 'ValidForURI' &&
      r.column === this.uniqueKey &&
      r.level === 'ERROR'
    ) {
      return false;
    }
    return ![
      'ValidDataTypeFormat',
      'ValidParentIdentifiers',
      'ValidFastqLibraryLayout',
      'ValidFastqFilenames',
      'ValidFastqMetadata',
    ].includes(r.name);
  }

  deleteRule($event, rule) {
    this.$mdDialog
      .show(
        this.$mdDialog
          .confirm()
          .textContent('Are you sure you want to delete this rule?')
          .ok('Delete')
          .targetEvent($event)
          .cancel('Cancel'),
      )
      .then(() => {
        const i = this.rules.indexOf(rule);
        this.rules.splice(i, 1);
        this.handleChange();
      })
      .catch(() => {});
  }

  editRule($event, rule) {
    this.$mdDialog
      .show({
        template: editTemplate,
        locals: {
          rule: angular.copy(rule),
          columns: this.attributes.map(a => a.column),
          lists: this.lists.map(l => l.alias),
          isArray: Array.isArray,
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {},
        controllerAs: '$ctrl',
        targetEvent: $event,
        autoWrap: false,
      })
      .then(r => {
        const i = this.rules.indexOf(rule);
        this.rules.splice(i, 1, r);
        this.handleChange();
      })
      .catch(() => {});
  }

  addRule($event) {
    this.$mdDialog
      .show({
        template: addTemplate,
        locals: {
          availableRules: AVAILABLE_RULES.map(r => new Rule(angular.copy(r))),
          columns: this.attributes.map(a => a.column),
          lists: this.lists.map(l => l.alias),
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {},
        controllerAs: '$ctrl',
        targetEvent: $event,
        autoWrap: false,
      })
      .then(r => {
        this.rules.push(r);
        this.handleChange();
      })
      .catch(() => {});
  }
}

export default {
  template,
  controller: ProjectConfigRulesController,
  bindings: {
    rules: '<',
    attributes: '<',
    lists: '<',
    uniqueKey: '<',
    onChange: '&',
  },
};

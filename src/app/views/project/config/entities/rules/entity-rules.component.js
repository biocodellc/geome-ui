import angular from 'angular';

import fimsEditRule from './rule.component';
import fimsRuleAdd from './add-rule.component';

class EntityRulesController {
  constructor(ConfirmationService) {
    'ngInject';

    this.ConfirmationService = ConfirmationService;
  }

  $onChanges(changesObj) {
    if (changesObj.rules) {
      this.rules = this.rules.slice();
    }
  }

  handleOnUpdate(index, rule) {
    this.rules.splice(index, 1, rule);
    this.onUpdateRules({ rules: this.rules });
  }

  handleOnDelete(index) {
    this.ConfirmationService.confirm(
      `Are you sure you want to delete this rule?`,
      () => {
        this.rules.splice(index, 1);
        this.onUpdateRules({ rules: this.rules });
      },
    );
  }

  handleToggleEdit(index) {
    if (this.editRule === index) {
      delete this.editRule;
    } else {
      this.editRule = index;
    }
  }

  isArray(val) {
    return Array.isArray(val);
  }
}

const fimsEntityRules = {
  template: require('./rules.html'),
  controller: EntityRulesController,
  bindings: {
    rules: '<',
    lists: '<',
    columns: '<',
    onUpdateRules: '&',
    onDeleteRule: '&',
  },
};

export default angular
  .module('fims.projectConfigEntityRules', [fimsEditRule, fimsRuleAdd])
  .component('fimsEntityRules', fimsEntityRules).name;

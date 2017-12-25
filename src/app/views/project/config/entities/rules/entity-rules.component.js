import angular from 'angular';

import fimsEditRule from './rule.component';
import fimsRuleAdd from './rule-add.component';


class EntityRulesController {
  $onChanges(changesObj) {
    if (changesObj.rules) {
      this.rules = this.rules.slice();
    }
  }

  handleOnDelete(index) {
    this.rules.splice(index, 1);
    this.onUpdateRules({ rules: this.rules });
  }

  handleToggleEdit(index) {
    if (this.editRule === index) {
      delete this.editRule;
    } else {
      this.editRule = index;
    }
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

export default angular.module('fims.projectConfigEntityRules', [ fimsEditRule, fimsRuleAdd ])
  .component('fimsEntityRules', fimsEntityRules)
  .name;

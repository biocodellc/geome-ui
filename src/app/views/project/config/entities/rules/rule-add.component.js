import { AVAILABLE_RULES, RULE_LEVELS } from "../../Rule";
import angular from "angular";

class AddRuleController {
  $onInit() {
    this.availableRules = AVAILABLE_RULES;
    this.rule = undefined;
    this.levels = RULE_LEVELS;
  }
}


const fimsProjectConfigRuleAdd = {
  template: require('./add-rule.html'),
  controller: AddRuleController,
  bindings: {
    lists: '<',
    columns: '<',
    onAddRule: '&',
  },
};

export default angular.module('fims.projectConfigRuleAdd', [])
  .component('fimsProjectConfigRuleAdd', fimsProjectConfigRuleAdd)
  .name;

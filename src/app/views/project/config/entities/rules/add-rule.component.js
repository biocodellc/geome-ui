import { AVAILABLE_RULES, RULE_LEVELS } from "../../../../../models/Rule";
import angular from "angular";
import Rule from "../../../../../models/Rule";

class AddRuleController {
  $onInit() {
    this.availableRules = AVAILABLE_RULES.map(r => new Rule(r));
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

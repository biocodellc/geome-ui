import angular from "angular";

import { RULE_LEVELS } from "../../Rule";
import fimsRuleMetadata from './rule-metadata.component';

class EditRuleFormController {
  $onInit() {
    this.levels = RULE_LEVELS;
  }
}


const fimsProjectConfigRuleEditForm = {
  template: require('./edit-rule-form.html'),
  controller: EditRuleFormController,
  bindings: {
    rule: '<', //TODO fix this, as we are editing the parent components data
    lists: '<',
    columns: '<',
  },
};

export default angular.module('fims.projectConfigRuleEditForm', [ fimsRuleMetadata ])
  .component('fimsProjectConfigRuleEditForm', fimsProjectConfigRuleEditForm)
  .name;

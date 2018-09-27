import angular from 'angular';

import { RULE_LEVELS } from '../../../../models/Rule';
import fimsRuleMetadata from './rule-metadata.component';

const template = require('./edit-rule-form.html');

class EditRuleFormController {
  $onInit() {
    this.levels = RULE_LEVELS;
  }

  isArray(val) {
    return Array.isArray(val);
  }
}

const fimsEditRuleForm = {
  template,
  controller: EditRuleFormController,
  bindings: {
    rule: '<', // TODO fix this, as we are editing the parent components data
    lists: '<',
    columns: '<',
  },
};

export default angular
  .module('fims.projectConfigRuleEditForm', [fimsRuleMetadata])
  .component('fimsEditRuleForm', fimsEditRuleForm).name;

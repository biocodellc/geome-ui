import angular from 'angular';

import fimsEditRuleForm from './edit-rule-form.component';
import Rule from '../../../../models/Rule';

class EditRuleController {
  $onInit() {
    this.rule = new Rule(this.rule);
  }

  $onDestroy() {
    this.onUpdate({ rule: this.rule });
  }
}

const fimsEditRule = {
  template: require('./edit-rule.html'),
  controller: EditRuleController,
  bindings: {
    rule: '<',
    lists: '<',
    columns: '<',
    onClose: '&',
    onUpdate: '&',
  },
};

export default angular
  .module('fims.projectConfigRule', [fimsEditRuleForm])
  .component('fimsEditRule', fimsEditRule).name;

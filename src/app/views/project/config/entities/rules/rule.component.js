import angular from 'angular';

import fimsRuleEditForm from './edit-rule-form.component';


class EditRuleController {
  $onInit() {
    this.rule = Object.assign({}, this.rule);
  }

  $onDestroy() {
    this.onUpdate({ rule: this.rule });
  }
}

const fimsRuleEdit = {
  template: require('./edit-rule.html'),
  controller: EditRuleController,
  bindings: {
    rule: '<',
    lists: '<',
    columns: '<',
    onUpdate: '&',
  },
};


export default angular.module('fims.projectConfigRule', [ fimsRuleEditForm ])
  .component('fimsEditRule', fimsRuleEdit)
  .name;

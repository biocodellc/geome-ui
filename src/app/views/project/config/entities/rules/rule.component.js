import angular from 'angular';

import { RULE_LEVELS } from "../../Rule";
import fimsRuleMetadata from './rule-metadata.component';


class EditRuleController {
  $onInit() {
    this.rule = Object.assign({}, this.rule);
    this.levels = RULE_LEVELS;
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
    onClose: '&',
  },
};


export default angular.module('fims.projectConfigRule', [ fimsRuleMetadata ])
  .component('fimsEditRule', fimsRuleEdit)
  .name;

import angular from 'angular';
import { RULE_LEVELS } from '../../models/Rule';

const template = require('./edit-rule-form.html');

const fimsMdRuleForm = {
  template,
  controller: function Controller() {
    this.levels = RULE_LEVELS;
  },
  bindings: {
    rule: '<',
    columns: '<',
    lists: '<',
  },
};

export default angular
  .module('fims.projectConfigMdRuleForm', [])
  .component('fimsMdRuleForm', fimsMdRuleForm).name;

import angular from 'angular';
import mdDataTable from 'biocode-angular-material-data-table';
import 'biocode-angular-material-data-table/dist/md-data-table.min.css';
import fixedTableHeader from '../../directives/fixedTableHeader.directive';
import projectConfigRules from './project-config-rules.component';
import mdRuleMetadata from './md-rule-metadata.component';
import mdRuleForm from './md-rule-form.component';

export default angular
  .module('fims.projectConfigRules', [
    mdDataTable,
    fixedTableHeader,
    mdRuleMetadata,
    mdRuleForm,
  ])
  .component('fimsProjectConfigRules', projectConfigRules).name;

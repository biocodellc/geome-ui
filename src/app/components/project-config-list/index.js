import angular from 'angular';
import mdDataTable from 'biocode-angular-material-data-table';
import fixedTableHeader from '../../directives/fixedTableHeader.directive';
import projectConfigList from './project-config-list.component';

export default angular
  .module('fims.projectConfigList', [mdDataTable, fixedTableHeader])
  .component('fimsProjectConfigList', projectConfigList).name;

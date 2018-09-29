import angular from 'angular';
import 'angular-drag-and-drop-lists';
import mdDataTable from 'biocode-angular-material-data-table';
import 'biocode-angular-material-data-table/dist/md-data-table.min.css';
import fixedTableHeader from '../../directives/fixedTableHeader.directive';
import projectConfigAttributes from './project-config-attributes.component';

export default angular
  .module('fims.projectConfigAttributes', [
    mdDataTable,
    fixedTableHeader,
    'dndLists',
  ])
  .component('fimsProjectConfigAttributes', projectConfigAttributes).name;

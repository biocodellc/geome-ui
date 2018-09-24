import angular from 'angular';
import mdDataTable from 'biocode-angular-material-data-table';
import fixedTableHeader from '../../directives/fixedTableHeader.directive';
import projectConfigExpeditionMetadata from './project-config-expedition-metadata.component';

export default angular
  .module('fims.projectConfigMdExpeditionMetadata', [
    mdDataTable,
    fixedTableHeader,
  ])
  .component(
    'fimsProjectConfigExpeditionMetadata',
    projectConfigExpeditionMetadata,
  ).name;

import angular from 'angular';
import mdDataTable from 'biocode-angular-material-data-table';
import fixedTableHeader from '../../directives/fixedTableHeader.directive';
import networkConfigList from './network-config-list.component';

export default angular
  .module('fims.networkConfigList', [mdDataTable, fixedTableHeader])
  .component('fimsNetworkConfigList', networkConfigList).name;

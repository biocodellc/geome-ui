import angular from 'angular';

import fimsProjectConfigLists from './lists.component';
import fimsListDetail from './list-detail.component';
import fimsNetworkConfigList from '../../../components/network-config-list';

export default angular
  .module('fims.projectConfigLists', [fimsNetworkConfigList, fimsListDetail])
  .component('fimsProjectConfigLists', fimsProjectConfigLists).name;

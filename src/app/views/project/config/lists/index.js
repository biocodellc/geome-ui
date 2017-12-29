import angular from 'angular';

import fimsProjectConfigLists from './lists.component';
import fimsConfigList from './list.component';
import fimsAddList from './add-list.component';
import fimsListDetail from './list-detail.component';

export default angular.module('fims.projectConfigLists', [ fimsConfigList, fimsAddList, fimsListDetail ])
  .component('fimsProjectConfigLists', fimsProjectConfigLists)
  .name;

import angular from 'angular';

import navigation from './navigation.component';

export default angular.module('fims.navigation', [])
  .component('fimsNavigation', navigation)
  .name;

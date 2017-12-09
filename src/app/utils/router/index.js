import angular from 'angular';

import routerHelperProvider from "./routerHelperProvider";

export default angular.module('fims.router', [])
  .provider('routerHelper', routerHelperProvider)
  .name;

import angular from 'angular';

import routing from './home.routes.js'
import home from './home.component';

export default angular.module('fims.home', [])
  .run(routing)
  .component('home', home)
  .name;

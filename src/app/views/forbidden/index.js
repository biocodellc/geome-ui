import angular from 'angular';

import routing from './forbidden.routes';
import forbidden from './forbidden.component';

export default angular
  .module('fims.forbidden', [])
  .run(routing)
  .component('forbidden', forbidden).name;

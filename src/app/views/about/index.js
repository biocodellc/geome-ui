import angular from 'angular';

import routing from './about.routes';
import about from './about.component';

export default angular
  .module('fims.about', [])
  .run(routing)
  .component('about', about).name;

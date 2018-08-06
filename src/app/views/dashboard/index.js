import angular from 'angular';

import routing from './dashboard.routes';
import dashboard from './dashboard.component';

export default angular
  .module('fims.dashboard', [])
  .run(routing)
  .component('fimsDashboard', dashboard).name;

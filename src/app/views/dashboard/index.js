import angular from 'angular';

import routing from './dashboard.routes';
import fimsDashboard from './dashboard.component';

export default angular
  .module('fims.dashboard', [])
  .run(routing)
  .component('fimsDashboard', fimsDashboard).name;

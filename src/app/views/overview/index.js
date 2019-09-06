import angular from 'angular';

import routing from './overview.routes';
import fimsOverview from './overview.component';

export default angular
  .module('fims.overview', [])
  .run(routing)
  .component('fimsOverview', fimsOverview).name;

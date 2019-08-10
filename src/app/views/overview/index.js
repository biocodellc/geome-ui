import angular from 'angular';

import routing from './overview.routes';
import overview from './overview.component';

export default angular
  .module('fims.overview', [])
  .run(routing)
  .component('fimsOverview', overview).name;

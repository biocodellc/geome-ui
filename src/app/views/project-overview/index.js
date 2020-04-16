import angular from 'angular';

import routing from './project-overview.routes';
import fimsProjectOverview from './project-overview.component';

export default angular
  .module('fims.projectOverview', [])
  .run(routing)
  .component('fimsProjectOverview', fimsProjectOverview).name;

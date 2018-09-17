import angular from 'angular';

import routing from './project-config.routes';
import fimsProjectConfig from './project-config.component';
import fimsProjectConfigOverview from './config-overview.component';
import confirmation from '../../utils/delete-confirmation';

export default angular
  .module('fims.projectConfig', [fimsProjectConfigOverview, confirmation])
  .run(routing)
  .component('fimsProjectConfig', fimsProjectConfig).name;

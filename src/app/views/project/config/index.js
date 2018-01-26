import angular from 'angular';

import routing from './project-config.routes';
import confirmExit from './confirmExit.hook';
import fimsProjectConfig from './project-config.component';
import fimsProjectConfigOverview from './config-overview.component';
import ProjectConfigService from './project-config.service';
import confirmation from '../../../utils/delete-confirmation';

export default angular
  .module('fims.projectConfig', [fimsProjectConfigOverview, confirmation])
  .run(routing)
  .run(confirmExit)
  .component('fimsProjectConfig', fimsProjectConfig)
  .service('ProjectConfigService', ProjectConfigService).name;

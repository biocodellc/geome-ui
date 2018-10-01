import angular from 'angular';

import routing from './project-config.routes';
import fimsProjectConfigSettings from './settings';
import fimsProjectConfigEntities from './entities';
import fimsProjectConfigLists from './lists';
import fimsProjectConfig from './project-config.component';

export default angular
  .module('fims.projectConfig', [
    fimsProjectConfigEntities,
    fimsProjectConfigSettings,
    fimsProjectConfigLists,
  ])
  .run(routing)
  .component('fimsProjectConfig', fimsProjectConfig).name;

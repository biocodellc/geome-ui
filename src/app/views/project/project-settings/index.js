import routing from './project-settings.routes';
import fimsProjectSettings from './project-settings.component';

export default angular
  .module('fims.projectSettings', [])
  .run(routing)
  .component('fimsProjectSettings', fimsProjectSettings).name;

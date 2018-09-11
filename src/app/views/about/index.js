import angular from 'angular';

import routing from './about.routes';
import about from './about.component';
import projectInfo from './project-info/project-info.component';

export default angular
  .module('fims.about', [])
  .run(routing)
  .component('projectInfo', projectInfo)
  .component('about', about).name;

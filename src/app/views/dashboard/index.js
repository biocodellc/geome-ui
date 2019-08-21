import angular from 'angular';

import routing from './dashboard.routes';
import fimsDashboardMyProjects from './my-projects';
import fimsDashboardPublicProjects from './public-projects';
import fimsDashboardMemberProjects from './member-projects';
import fimsDashboard from './dashboard.component';

export default angular
  .module('fims.dashboard', [
    fimsDashboardMyProjects,
    fimsDashboardPublicProjects,
    fimsDashboardMemberProjects,
  ])
  .run(routing)
  .component('fimsDashboard', fimsDashboard).name;

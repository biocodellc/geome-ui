import angular from 'angular';

import routing from './dashboard.routes';
import fimsDashboard from './dashboard.component';
import projectsTable from './projects-table/projects-table.component';

export default angular
  .module('fims.dashboard', [])
  .run(routing)
  .component('fimsDashboard', fimsDashboard)
  .component('projectsTable', projectsTable).name;

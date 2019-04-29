import angular from 'angular';

import routing from './dashboard.routes';
import dashboard from './dashboard.component';
import dashboardExpedition from './dashboard-expedition.component';
import projectService from '../../services/project.service';

export default angular
  .module('fims.dashboard', [projectService])
  .run(routing)
  .component('fimsDashboard', dashboard)
  .component('fimsDashboardExpedition', dashboardExpedition).name;

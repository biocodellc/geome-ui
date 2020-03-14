import angular from 'angular';

import routing from './team-overview.routes';
import fimsTeamOverview from './team-overview.component';

export default angular
  .module('fims.teamOverview', [])
  .run(routing)
  .component('fimsTeamOverview', fimsTeamOverview).name;

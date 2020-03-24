import angular from 'angular';

import routing from './teams-list.routes';
import fimsTeamsList from './teams-list.component';

export default angular
  .module('fims.teamsList', [])
  .run(routing)
  .component('fimsTeamsList', fimsTeamsList).name;

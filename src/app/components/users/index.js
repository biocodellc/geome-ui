import angular from 'angular';

//TODO fix circular dependency auth -> user -> auth
// import auth from '../auth';
import exceptions from '../exceptions';
import alerts from '../alerts';
import compareTo from '../../directives/compareTo.directive';

import routing from "./users.routes";
import UserService from "./UserService";


function run(UserService) {
  UserService.loadUserFromSession();
}

run.$inject = [ 'UserService' ];

export default angular.module('fims.users', [ exceptions, alerts, compareTo ])
  .run(run)
  .run(routing)
  .service('UserService', UserService)
  .name;

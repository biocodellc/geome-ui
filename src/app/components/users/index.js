import angular from 'angular';

//TODO fix circular dependency auth -> user -> auth
import authService from '../../services/auth.service';
import compareTo from '../../directives/compareTo.directive';

import routing from "./users.routes";
import UserService from "./UserService";


function run(UserService) {
  'ngInject';
  UserService.loadUserFromSession();
}

export default angular.module('fims.users', [ compareTo, authService ])
  .run(run)
  .run(routing)
  .service('UserService', UserService)
  .name;

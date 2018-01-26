import angular from 'angular';

import userService from '../../services/user.service';
import authService from '../../services/auth.service';

import routing from './login.routes.js';
import login from './login.component';

export default angular
  .module('fims.login', [userService, authService])
  .run(routing)
  .component('fimsLogin', login).name;

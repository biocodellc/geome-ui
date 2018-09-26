import angular from 'angular';

import userService from '../../services/user.service';
import authService from '../../services/auth.service';

import register from './register.component';
import routing from './register.routes';

export default angular
  .module('fims.register', [userService, authService])
  .run(routing)
  .component('fimsRegister', register).name;

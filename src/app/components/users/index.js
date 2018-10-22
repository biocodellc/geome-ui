import angular from 'angular';
import 'ng-password-strength';

import routing from './users.routes';
import userService from '../../services/user.service';

import profile from './profile.component';
import resetPass from './reset-pass.component';

export default angular
  .module('fims.users', [userService, 'ngPasswordStrength'])
  .run(routing)
  .component('fimsProfile', profile)
  .component('fimsResetPass', resetPass).name;

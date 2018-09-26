import angular from 'angular';

import routing from './users.routes';
import userService from '../../services/user.service';

import profile from './profile.component';
import newUser from './new-user.component';
import resetPass from './reset-pass.component';

export default angular
  .module('fims.users', [userService])
  .run(routing)
  .component('fimsProfile', profile)
  .component('fimsNewUser', newUser)
  .component('fimsResetPass', resetPass).name;

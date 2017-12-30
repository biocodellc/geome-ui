import angular from 'angular';

import compareTo from '../../directives/compareTo.directive';
import routing from "./users.routes";
import userService from '../../services/users.service';

import profile from './profile.component';
import newUser from './new-user.component';
import resetPass from './reset-pass.component';


export default angular.module('fims.users', [ compareTo, userService ])
  .run(routing)
  .component('fimsProfile', profile)
  .component('fimsNewUser', newUser)
  .component('fimsResetPass', resetPass)
  .name;

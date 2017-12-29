import angular from 'angular';

import authService from '../../services/auth.service';
import users from '../users';

import AuthInterceptor from './auth.interceptor';
import requiresLogin from './loginRequired.hook.js'

const FOUR_HOURS = 1000 * 60 * 60 * 4;

const config = ($httpProvider) => {
  'ngInject';
  $httpProvider.interceptors.push('AuthInterceptor');
};

export default angular.module('fims.auth', [ users, authService ])
  .config(config)
  .run(requiresLogin)
  .constant('AUTH_TIMEOUT', FOUR_HOURS)
  .service('AuthInterceptor', AuthInterceptor)
  .name;

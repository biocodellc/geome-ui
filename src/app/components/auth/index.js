import angular from 'angular';

import alerts from '../alerts';
import storage from '../storage';
import users from '../users';

import AuthInterceptor from './auth.interceptor';
import AuthService from './auth.service';
import requiresLogin from './loginRequired.hook.js'

const FOUR_HOURS = 1000 * 60 * 60 * 4;

const config = ($httpProvider) => {
  'ngInject';
  $httpProvider.interceptors.push('AuthInterceptor');
};

export default angular.module('fims.auth', [ storage, users, alerts ])
  .config(config)
  .run(requiresLogin)
  .constant('AUTH_TIMEOUT', FOUR_HOURS)
  .service('AuthService', AuthService)
  .service('AuthInterceptor', AuthInterceptor)
  .name;

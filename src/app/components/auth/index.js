import angular from 'angular';

import alerts from '../alerts';
import storage from '../storage';
import users from '../users';

import AuthInterceptor from './AuthInterceptor';
import AuthService from './AuthService';
import LoginController from './LoginController';
import routing from './auth.routes.js'

const FOUR_HOURS = 1000 * 60 * 60 * 4;

const config = ($httpProvider) => {
  $httpProvider.interceptors.push('AuthInterceptor');
};

config.$inject = [ '$httpProvider' ];

export default angular.module('fims.auth', [ storage, users, alerts ])
  .config(config)
  // .run(routing)
  .config(routing)
  .constant('AUTH_TIMEOUT', FOUR_HOURS)
  .service('AuthInterceptor', AuthInterceptor)
  .service('AuthService', AuthService)
  .controller("LoginController", LoginController)
  .name;

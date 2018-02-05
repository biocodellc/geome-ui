import angular from 'angular';

import authService from '../../services/auth.service';
import userService from '../../services/user.service';

import AuthInterceptor from './auth.interceptor';
import requiresLogin from './loginRequired.hook';

const config = $httpProvider => {
  'ngInject';

  $httpProvider.interceptors.push('AuthInterceptor');
};

export default angular
  .module('fims.auth', [authService, userService])
  .config(config)
  .run(requiresLogin)
  .service('AuthInterceptor', AuthInterceptor).name;

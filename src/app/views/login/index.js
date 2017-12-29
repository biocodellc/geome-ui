import angular from 'angular';

import auth from '../../components/auth';

import routing from './login.routes.js'
import login from './login.component';

export default angular.module('fims.login', [ auth ])
  .run(routing)
  .component('fimsLogin', login)
  .name;

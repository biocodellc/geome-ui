import angular from 'angular';

import routing from './routes.js'

export default angular.module('fims.home', [ ])
  .config(routing)
  .name;

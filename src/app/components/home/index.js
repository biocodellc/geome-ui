import angular from 'angular';

import routing from './routes.js'

export default angular.module('fims.home', [ ])
  .run(routing)
  .name;

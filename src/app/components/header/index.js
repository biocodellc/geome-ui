import angular from 'angular';

import projects from '../projects';
import users from '../users';

import HeaderController from './header.controller';

let header = () => ({
  template: require('./header.html'),
  controller: HeaderController,
  controllerAs: 'header',
});

export default angular.module('fims.header', [ projects, users ])
  .directive('fimsHeader', header)
  .name;

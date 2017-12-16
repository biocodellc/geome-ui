import angular from 'angular';

import routing from './routes.js'

const home = {
  template: require('./home.html'),
};

export default angular.module('fims.home', [])
  .run(routing)
  .component('home', home)
  .name;

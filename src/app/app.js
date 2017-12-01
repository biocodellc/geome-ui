import angular from 'angular';
import uirouter from '@uirouter/angularjs';
import bootstrap from 'angular-ui-bootstrap';

// this loads the css for the app
// import '../style/app.scss';
import '../style/app-test.css'

import run from './app.run';
import routing from './app.routes'
import postInterceptor from './postInterceptor';
import alerts from './components/alerts';
//
// var app = angular.module('biscicolApp', [
//   'fims.header',
//   'fims.query',
//   'fims.auth',
//   'fims.templates',
//   'fims.expeditions',
//   'fims.validation',
//   'fims.projects',
//   'fims.users',
//   'fims.modals',
//   'fims.lookup',
//   'fims.creator',
//   'utils.autofocus',
//   'ui.bootstrap.showErrors',
//   'angularSpinner'
// ]);

const dependencies = [
  uirouter,
  postInterceptor,
  bootstrap,
  alerts,
];

let app = () => {
  return {
    template: require('./app.html'),
    controller: 'AppCtrl',
    controllerAs: 'app'
  }
};

class AppCtrl {
  constructor() {
    this.url = 'https://github.com/preboot/angular-webpack';
  }
}

const MODULE_NAME = 'biscicolApp';

angular.module(MODULE_NAME, dependencies)
  .directive('app', app)
  .run(run)
  // .config(routing)
  .controller('AppCtrl', AppCtrl);

export default MODULE_NAME;
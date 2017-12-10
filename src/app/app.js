import angular from 'angular';
import uirouter from '@uirouter/angularjs';
import bootstrap from 'angular-ui-bootstrap';

// this loads the css for the app
import '../style/app.scss';

import run from './app.run';
// import routing from './app.routes'
import router from './utils/router';
import postInterceptor from './postInterceptor';
import autofocus from './directives/autofocus.directive';
import showErrors from './directives/showErrors.directive';
import trustedHtml from './filters/html.filter';

import alerts from './components/alerts';
import auth from './components/auth';
import data from './components/data';
import exceptions from './components/exceptions';
import expeditions from './components/expeditions';
import files from './components/files';
import header from './components/header';
import home from './components/home';
// import lookup from './components/lookup';
import modals from './components/modals';
import projects from './components/projects';
import query from './components/query';
import storage from './components/storage';
import templates from './components/templates';
import users from './components/users';
// import validation from './components/validation';


const dependencies = [
  uirouter,
  router,
  postInterceptor,
  autofocus,
  showErrors,
  trustedHtml,
  bootstrap,
  alerts,
  header,
  query,
  auth,
  templates,
  expeditions,
  // validation,
  projects,
  users,
  modals,
  storage,
  // lookup,
];

let app = () => {
  return {
    template: require('./app.html'),
    controller: AppCtrl,
    controllerAs: 'app',
  }
};

class AppCtrl {
  constructor() {
    this.url = 'https://github.com/preboot/angular-webpack';
  }
}

export default angular.module('biscicolApp', dependencies)
  .directive('app', app)
  .run(run)
  //TODO figure out a better config system
  .constant("NAAN", "99999")
  .constant("REST_ROOT", "http://localhost:8080/biocode-fims/rest/v2/")
  .constant("ID_REST_ROOT", "http://localhost:8080/id/v2/")
  // When changing this, also need to change <base> tag in index.html
  .constant("APP_ROOT", "/")
  .constant("MAPBOX_TOKEN", "{mapboxToken}")
  .name;

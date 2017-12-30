import angular from 'angular';
import uirouter from '@uirouter/angularjs';
import bootstrap from 'angular-ui-bootstrap';

// todo remove the following and use only angular-ui-bootstrap
import 'jquery-ui';
import 'bootstrap-sass';


// this loads the css for the app
import '../style/app.scss';

import run from './app.run';
// import routing from './app.routes'
import router from './utils/router';
import postInterceptor from './postInterceptor';
import autofocus from './directives/autofocus.directive';
import showErrors from './directives/showErrors.directive';
import trustedHtml from './filters/html.filter';

import home from './views/home';
import login from './views/login';
import templates from './views/templates';
import project from './views/project';
import projectService from './services/project.service';
import userService from './services/user.service';

import app from './app.component';
import auth from './components/auth';
import expeditions from './views/expeditions/index';
import header from './components/header';
import navigation from './components/navigation';
import alerts from './components/alerts';
// import lookup from './components/lookup';
import modals from './components/modals';
import query from './components/query';
import users from './components/users';
// import validation from './components/validation';

import Exceptions from './utils/exceptions';
import Alerts from "./utils/alerts";

const dependencies = [
  uirouter,
  router,
  postInterceptor,
  autofocus,
  showErrors,
  trustedHtml,
  bootstrap,
  projectService,
  userService,
  header,
  navigation,
  alerts,
  home,
  login,
  query,
  auth,
  templates,
  expeditions,
  // validation,
  project,
  users,
  modals,
  // lookup,
];

// attach global objects for easy access throughout app
angular.alerts = new Alerts();
const e = new Exceptions();
angular.catcher = e.catcher.bind(e);

export default angular.module('biscicolApp', dependencies)
  .component('app', app)
  .run(run)
  //TODO figure out a better config system
  .constant("NAAN", "99999")
  .constant("REST_ROOT", "http://localhost:8080/biocode-fims/rest/v2/")
  .constant("ID_REST_ROOT", "http://localhost:8080/id/v2/")
  // When changing this, also need to change <base> tag in index.html
  .constant("APP_ROOT", "/")
  .constant("MAPBOX_TOKEN", "{mapboxToken}")
  .name;

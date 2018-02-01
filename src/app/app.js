import angular from 'angular';
import uirouter from '@uirouter/angularjs';
import bootstrap from 'angular-ui-bootstrap';

// todo remove the following and use only angular-ui-bootstrap
import 'jquery-ui';
import 'bootstrap-sass';

// this loads the css for the app
import '../style/app.scss';

// use async functions w/ babel
import 'babel-polyfill';

import run from './app.run';
import routing from './app.routes';
import router from './utils/router';
import postInterceptor from './postInterceptor';
import autofocus from './directives/autofocus.directive';
import showErrors from './directives/showErrors.directive';
import trustedHtml from './filters/html.filter';

import home from './views/home';
// import notFound from './views/not-found';
import contact from './views/contact';
import login from './views/login';
import templates from './views/templates';
import project from './views/project';
import expeditions from './views/expeditions';
import validation from './views/validation';

import projectService from './services/project.service';
import userService from './services/user.service';

import app from './app.component';
import auth from './components/auth';
import header from './components/header';
import navigation from './components/navigation';
import alerts from './components/alerts';
// import lookup from './components/lookup';
import modals from './components/modals';
import query from './components/query';
import users from './components/users';

import Exceptions from './utils/exceptions';
import Alerts from './utils/alerts';

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
  contact,
  // notFound,
  login,
  query,
  auth,
  templates,
  expeditions,
  validation,
  project,
  users,
  modals,
  // lookup,
];

// attach global objects for easy access throughout app
angular.alerts = new Alerts();
const e = new Exceptions();
angular.catcher = e.catcher.bind(e);

export default angular
  .module('biscicolApp', dependencies)
  .component('app', app)
  .run(routing)
  .run(run);

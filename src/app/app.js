import angular from 'angular';
import uirouter from '@uirouter/angularjs';
import bootstrap from 'angular-ui-bootstrap';
import ngMaterial from 'angular-material';

// todo remove the following and use only angular-ui-bootstrap
import 'jquery-ui';

// this loads the css for the app
import '../style/bootstrap.scss';
import '../style/app.scss';

import run from './app.run';
import theme from './app.theme';
import routing from './app.routes';
import router from './utils/router';
import postInterceptor from './postInterceptor';
import autofocus from './directives/autofocus.directive';
import showErrors from './directives/showErrors.directive';
import trustedHtml from './filters/html.filter';

import about from './views/about';
import containerPage from './components/container-page';
import notFound from './views/not-found';
import contact from './views/contact';
import login from './views/login';
import templates from './views/templates';
import project from './views/project';
import expeditions from './views/expeditions';
import validation from './views/validation';
import query from './views/query';
import dashboard from './views/dashboard';

import projectService from './services/project.service';
import recordService from './services/record.service';
import userService from './services/user.service';

import app from './app.component';
import auth from './components/auth';
import header from './components/header';
import navigation from './components/navigation';
import alerts from './components/alerts';
// import lookup from './components/lookup';
import modals from './components/modals';
import users from './components/users';
import projectSelectorDialog from './components/project-selector-dialog';

import Exceptions from './utils/exceptions';
import Alerts from './utils/alerts';
import projectViewHook from './projectView.hook';

const dependencies = [
  uirouter,
  router,
  postInterceptor,
  autofocus,
  showErrors,
  trustedHtml,
  bootstrap,
  ngMaterial,
  projectService,
  userService,
  recordService,
  containerPage,
  header,
  navigation,
  alerts,
  about,
  contact,
  notFound,
  login,
  query,
  dashboard,
  auth,
  templates,
  expeditions,
  validation,
  project,
  users,
  projectSelectorDialog,
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
  .run(run)
  .run(projectViewHook)
  .config(theme);

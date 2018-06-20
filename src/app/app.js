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
import mdPopover from './directives/mdPopover.directive';
import mdSticky from './directives/mdSticky.directive';
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
import record from './views/record';

import projectService from './services/project.service';
import userService from './services/user.service';

import app from './app.component';
import auth from './components/auth';
import header from './components/header';
import navigation from './components/navigation';
// import lookup from './components/lookup';
import modals from './components/modals';
import users from './components/users';
import projectSelectorDialog from './components/project-selector-dialog';

import Exceptions from './utils/exceptions';
import Toaster from './utils/toaster';
import projectViewHook from './projectView.hook';
import fimsMdDialog from './utils/fimsMdDialog';

const dependencies = [
  uirouter,
  router,
  postInterceptor,
  autofocus,
  showErrors,
  mdPopover,
  mdSticky,
  trustedHtml,
  bootstrap,
  ngMaterial,
  projectService,
  userService,
  containerPage,
  header,
  navigation,
  about,
  contact,
  notFound,
  login,
  query,
  dashboard,
  record,
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
const e = new Exceptions();
angular.catcher = e.catcher.bind(e);

export default angular
  .module('biscicolApp', dependencies)
  .component('app', app)
  .run(
    /* ngInject */ $mdToast => {
      angular.toaster = Toaster($mdToast);
    },
  )
  .run(routing)
  .run(run)
  .run(projectViewHook)
  .config(fimsMdDialog)
  .config(theme);

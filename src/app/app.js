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
import templates from './views/templates';
import project, { CACHED_PROJECT_EVENT } from './views/project';

import alerts from './components/alerts';
import auth from './components/auth';
import data from './components/data';
import exceptions from './components/exceptions';
import expeditions from './components/expeditions';
import files from './components/files';
import header from './components/header';
import navigation from './components/navigation';
// import lookup from './components/lookup';
import modals from './components/modals';
import query from './components/query';
import storage from './components/storage';
import users from './components/users';
// import validation from './components/validation';

import Exceptions from './utils/exceptions';

const dependencies = [
  uirouter,
  router,
  postInterceptor,
  autofocus,
  showErrors,
  trustedHtml,
  bootstrap,
  alerts,
  exceptions,
  header,
  navigation,
  home,
  files,
  data,
  query,
  auth,
  templates,
  expeditions,
  // validation,
  project,
  users,
  modals,
  storage,
  // lookup,
];

class AppCtrl {
  constructor($scope, $state, UserService, Projects, alerts) {
    'ngInject';

    // attach global objects for easy access throughout app
    // TODO refactor alerts to utils, removing angular module
    // TODO not sure how I feel about this
    const e = new Exceptions(alerts);
    angular.catcher = e.catcher.bind(e);

    this.currentUser = undefined;
    this.currentProject = undefined;

    this.Projects = Projects;
    this.UserService = UserService;
    this.$state = $state;
    this.$scope = $scope;

    // TODO remove this
    $scope.$on("$logoutEvent", () => {
      this.currentUser = undefined;
      if (this.currentProject && this.currentProject.public === false) {
        Projects.set(undefined);
      }
    });

    // TODO remove this
    $scope.$on("$userChangeEvent", (user) => {
      this.currentUser = user;
    });

    $scope.$watch(
      () => UserService.currentUser,
      (user) => {
        this.currentUser = user;
      },
    );
  }

  $onInit() {
    // update if project has been loaded from session storage
    this.$scope.$on(CACHED_PROJECT_EVENT, (event, project) => {
      this.currentProject = project;
    });
  }

  handleProjectChange(project) {
    this.Projects.setCurrentProject(project).then((p) => {
      this.currentProject = p;
      this.$state.reload();
    });
  }

  signout() {
    this.currentUser = undefined;
    this.UserService.signout();
  }
}

const app = {
  template: require('./app.html'),
  controller: AppCtrl,
};


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

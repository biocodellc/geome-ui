import { AUTH_ERROR_EVENT } from "./services/auth.service";

class AppCtrl {
  constructor($rootScope, $state, UserService, ProjectService, AuthService, $location, StorageService) {
    'ngInject';

    this.currentUser = undefined;
    this.currentProject = undefined;

    this.ProjectService = ProjectService;
    this.UserService = UserService;
    this.StorageService = StorageService;
    this.AuthService = AuthService;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.$location = $location;

    this.loadSession();
    $rootScope.$on(AUTH_ERROR_EVENT, () => this.signout());
  }

  loadSession() {
    this.loading = true;
    const projectId = this.$location.search()[ 'projectId' ];

    const loadUser = () => {
      if (this.AuthService.getAccessToken()) {
        const username = this.StorageService.get('username');
        return this.UserService.get(username);
      }
      return Promise.resolve();
    };

    Promise.all([ this.ProjectService.loadFromSession(projectId), loadUser() ])
      .then(([ project, user ]) => {
        this.currentProject = project;
        this.ProjectService.setCurrentProject(project);

        this.currentUser = user;
        this.UserService.setCurrentUser(user);

        this.loading = false;
        this.$rootScope.$broadcast('$appInit');
      });
  }

  handleProjectChange(project) {
    this.ProjectService.setCurrentProject(project).then((p) => {
      this.currentProject = p;
      this.$state.reload();
    });
  }

  handleUserChange(user) {
    this.currentUser = user;
    this.UserService.setCurrentUser(user);
    this.$state.reload();
  }

  signout() {
    this.currentUser = undefined;
    this.UserService.setCurrentUser();

    if (this.currentProject && this.currentProject.public === false) {
      this.currentProject = undefined;
      this.ProjectService.setCurrentProject();
    }
    this.AuthService.clearTokens();
  }
}

export default {
  template: require('./app.html'),
  controller: AppCtrl,
};
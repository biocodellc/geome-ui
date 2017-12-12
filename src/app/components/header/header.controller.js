export default class HeaderController {
  constructor($scope, $location, $window, $state, UserService, ProjectService) {
    'ngInject'

    this.projectSelectorOpen = false;
    this.user = UserService.user;
    this.includePublicProjects = !(this.user);
    this.project = ProjectService.currentProject;
    this.projects = [];
    this.setProject = ProjectService.set.bind(ProjectService);

    this.scope = $scope;
    this.location = $location;
    this.window = $window;
    this.state = $state;
    this.projectService = ProjectService;
    this.userService = UserService;

    this._getProjects();

    this.scope.$watch(
      () => {
        return this.userService.currentUser;
      },
      (user) => {
        this.user = user;
        this.includePublicProjects = !(user);
        this._getProjects();
      },
    );

    this.scope.$on('$projectChangeEvent', (event, project) => {
      this.project = project;
    });


    this.scope.$watch('this.includePublicProjects', (newVal, oldVal) => {
      if (newVal !== oldVal) {
        this._getProjects();
      }
    });
  }

  apidocs() {
    this.window.location = "http://biscicol.org/apidocs?url=" + this.location.$$absUrl.replace(this.location.path(), "/apidocs/current/service.json")
  }

  login() {
    this.state.go('login', { nextState: this.state.current.name, nextStateParams: this.state.params });
  }

  logout() {
    this.userService.signOut();
  }

  _getProjects() {
    this.projectService.all(this.includePublicProjects)
      .then((response) => {
          this.projects = response.data;
        },
      );
  }
}

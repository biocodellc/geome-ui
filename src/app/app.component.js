import { CACHED_PROJECT_EVENT } from "./views/project";

class AppCtrl {
  constructor($scope, $state, UserService, ProjectService) {
    'ngInject';

    this.currentUser = undefined;
    this.currentProject = undefined;

    this.ProjectService = ProjectService;
    this.UserService = UserService;
    this.$state = $state;
    this.$scope = $scope;

    // TODO remove this
    $scope.$on("$logoutEvent", () => {
      this.currentUser = undefined;
      if (this.currentProject && this.currentProject.public === false) {
        ProjectService.set(undefined);
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
    this.ProjectService.setCurrentProject(project).then((p) => {
      this.currentProject = p;
      this.$state.reload();
    });
  }

  signout() {
    this.currentUser = undefined;
    this.UserService.signout();
  }
}

export default {
  template: require('./app.html'),
  controller: AppCtrl,
};
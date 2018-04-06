import { AUTH_ERROR_EVENT } from './services/auth.service';
import { PROJECT_CHANGED_EVENT } from './services/project.service';
import { USER_CHANGED_EVENT } from './services/user.service';

const template = require('./app.html');

class AppCtrl {
  constructor($state, $transitions, UserService, ProjectService, AuthService) {
    'ngInject';

    this.ProjectService = ProjectService;
    this.UserService = UserService;
    this.AuthService = AuthService;
    this.$state = $state;
    this.$transitions = $transitions;
    this.projectView = false;
  }

  $onInit() {
    this.loading = true;

    this.AuthService.on(AUTH_ERROR_EVENT, () => this.signout());
    this.ProjectService.on(PROJECT_CHANGED_EVENT, p => {
      this.currentProject = p;
      if (!this.$state.current.abstract) this.$state.reload();
    });
    this.UserService.on(USER_CHANGED_EVENT, u => {
      this.currentUser = u;
      if (!this.$state.current.abstract) this.$state.reload();
    });

    // show spinner on transitions
    this.$transitions.onStart({}, trans => {
      const hasResolvables = s => {
        if (s.resolvables.length > 0) return true;
        if (!s.parent) return false;
        return hasResolvables(s.parent);
      };

      if (hasResolvables(trans.$to())) this.loading = true;
    });
    this.$transitions.onFinish({}, () => {
      this.loading = false;
    });
    this.$transitions.onError({}, () => {
      this.loading = false;
    });
    this.$transitions.onSuccess({}, transition => {
      this.projectView = transition.$to().parent === 'projectView';
    });
  }

  handleProjectChange(project) {
    this.ProjectService.setCurrentProject(project);
  }

  signout() {
    this.UserService.setCurrentUser();

    if (this.currentProject && this.currentProject.public === false) {
      this.ProjectService.setCurrentProject();
    }
    this.AuthService.clearTokens();
  }
}

export default {
  template,
  controller: AppCtrl,
};

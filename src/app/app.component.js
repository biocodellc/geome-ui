import { AUTH_ERROR_EVENT } from './services/auth.service';
import { PROJECT_CHANGED_EVENT } from './services/project.service';
import { USER_CHANGED_EVENT } from './services/user.service';
import {
  ProjectLoadingEmitter,
  LOADING_PROJECT_EVENT,
  FINISHED_LOADING_PROJECT_EVENT,
  checkProjectViewPresent,
} from './projectView.hook';

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
      const { current } = this.$state;
      if (!current.abstract && current.name !== 'login') this.$state.reload();
    });
    ProjectLoadingEmitter.on(
      LOADING_PROJECT_EVENT,
      () => (this.loading = true),
    );
    ProjectLoadingEmitter.on(
      FINISHED_LOADING_PROJECT_EVENT,
      () => (this.loading = false),
    );

    // show spinner on transitions
    this.$transitions.onStart({}, trans => {
      const hasResolvables = s => {
        if (s.resolvables.length > 0) return true;
        if (!s.parent) return false;
        return hasResolvables(s.parent);
      };

      if (hasResolvables(trans.$to())) this.loading = true;
    });
    this.$transitions.onError({}, trans => {
      const err = trans.error();
      if (err && err.message.includes('superseded')) return;
      this.loading = false;
    });
    this.$transitions.onSuccess({}, transition => {
      this.loading = false;
      this.projectView = checkProjectViewPresent(transition.$to());
    });
  }

  handleProjectChange(project) {
    this.loading = true;
    this.ProjectService.setCurrentProject(project).then(
      () => (this.loading = false),
    );
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

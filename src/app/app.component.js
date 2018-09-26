import { AUTH_ERROR_EVENT } from './services/auth.service';
import { PROJECT_CHANGED_EVENT } from './services/project.service';
import { USER_CHANGED_EVENT } from './services/user.service';
import {
  ProjectViewHookEmitter,
  LOADING_PROJECT_EVENT,
  FINISHED_LOADING_PROJECT_EVENT,
  checkProjectViewPresent,
  STARTED_HOOK_EVENT,
  ENDED_HOOK_EVENT,
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
    this.userHasProject = true;
  }

  $onInit() {
    this.loading = true;
    this.preventReload = false;

    this.AuthService.on(AUTH_ERROR_EVENT, () => this.signout());
    this.ProjectService.on(PROJECT_CHANGED_EVENT, p => {
      this.currentProject = p;
      if (!this.preventReload && !this.$state.current.abstract) {
        this.$state.reload();
      }
    });
    this.UserService.on(USER_CHANGED_EVENT, u => {
      this.currentUser = u;
      this.userHasProject = true;
      this.setUserHasProject();
      const { current } = this.$state;
      if (
        !this.preventReload &&
        !current.abstract &&
        current.name !== 'login'
      ) {
        this.$state.reload();
      }
    });
    ProjectViewHookEmitter.on(
      LOADING_PROJECT_EVENT,
      () => (this.loading = true),
    );
    ProjectViewHookEmitter.on(
      FINISHED_LOADING_PROJECT_EVENT,
      () => (this.loading = false),
    );
    ProjectViewHookEmitter.on(
      STARTED_HOOK_EVENT,
      () => (this.preventReload = true),
    );
    ProjectViewHookEmitter.on(
      ENDED_HOOK_EVENT,
      () => (this.preventReload = false),
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

  setUserHasProject() {
    this.ProjectService.all().then(({ data }) => {
      this.userHasProject = data.length > 0;
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

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
import { setUser, setProject } from './fims-analytics';

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
    this.preventReload = false;
    this.showSideNavigation = false;

    this.AuthService.on(AUTH_ERROR_EVENT, () => this.signout());
    this.ProjectService.on(PROJECT_CHANGED_EVENT, (p, ignoreReload) => {
      this.currentProject = p;
      this.setUserIsMember();
      setProject(p ? p.projectId : undefined);
      if (
        !ignoreReload &&
        !this.preventReload &&
        !this.$state.current.abstract
      ) {
        this.$state.reload();
      }
    });

    this.UserService.on(USER_CHANGED_EVENT, (u, ignoreReload) => {
      this.currentUser = u;
      if (u) {
        this.currentUser.userHasProject = true;
        this.setUserHasProject();
      }
      this.setUserIsMember();
      const { current } = this.$state;
      setUser(u ? u.username : undefined);
      if (
        !ignoreReload &&
        !this.preventReload &&
        !current.abstract &&
        current.name !== 'login'
      ) {
        this.$state.reload();
      }
    });

    ProjectViewHookEmitter.on(LOADING_PROJECT_EVENT, () => {
      this.loading = true;
    });
    ProjectViewHookEmitter.on(STARTED_HOOK_EVENT, () => {
      this.preventReload = true;
    });
    ProjectViewHookEmitter.on(ENDED_HOOK_EVENT, () => {
      this.preventReload = false;
    });

    // show spinner on transitions
    this.$transitions.onStart({}, trans => {
      const hasResolvables = s => {
        if (s.showLoading === false) return false;
        if (s.resolvables.length > 0) return true;
        if (!s.parent) return false;
        return hasResolvables(s.parent);
      };

      if (hasResolvables(trans.$to())) this.loading = true;
    });
    this.$transitions.onFinish({}, trans => {
      const err = trans.error();
      if (err && err.message.includes('superseded')) return;
      this.loading = false;
      this.projectView = checkProjectViewPresent(trans.$to());
    });
  }

  setUserHasProject() {
    this.ProjectService.all().then(({ data }) => {
      this.currentUser.userHasProject = data.length > 0;
    });
  }

  setUserIsMember() {
    if (this.currentProject) {
      if (!this.currentUser) {
        this.currentProject.currentUserIsMember = false;
        return;
      }

      this.ProjectService.all().then(({ data }) => {
        this.currentProject.currentUserIsMember = data.some(
          p => p.projectId === this.currentProject.projectId,
        );
      });
    }
  }

  handleProjectChange(project) {
    this.loading = true;
    this.ProjectService.setCurrentProject(project);
  }

  signout() {
    this.UserService.setCurrentUser();

    if (this.currentProject && this.currentProject.public === false) {
      this.ProjectService.setCurrentProject();
    }
    this.AuthService.clearTokens();
  }

  toggleSideNav() {
    this.showSideNavigation = !this.showSideNavigation;
  }
}

export default {
  template,
  controller: AppCtrl,
};

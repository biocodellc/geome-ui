import '../../../style/fims/_projectSelector.scss';

const template = require('./projectSelector.html');

class ProjectSelectorController {
  constructor(ProjectService, $state, $mdDialog) {
    'ngInject';

    this.ProjectService = ProjectService;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.projects = [];
    this.isOpen = false;
  }

  $onChanges(changesObj) {
    let filterProjects = false;
    if ('isAuthenticated' in changesObj) {
      this.includePublicProjects = !this.isAuthenticated;
      filterProjects = true;
    }

    if (changesObj.currentProject) {
      filterProjects = true;
    }

    if (filterProjects) this.filterProjects();
  }

  filterProjects() {
    // TODO can we define a schema on the User?
    // then we can return the ids of the projects a user is a member of, and make this a dumb component, just filtering here which is faster
    this.ProjectService.all(this.includePublicProjects).then(({ data }) => {
      if (
        !this.includePublicProjects &&
        this.currentProject &&
        !data.find(p => p.projectId === this.currentProject.projectId)
      ) {
        this.includePublicProjects = true;
        this.filterProjects();
        return;
      }
      this.projects = data;
    });
  }

  change(project) {
    this.onChange({ project });
    this.isOpen = false;
  }

  go() {
    this.$state.go('login').then(() => {
      this.$mdDialog.cancel();
    });
  }
}

export default {
  template,
  controller: ProjectSelectorController,
  bindings: {
    offset: '@',
    buttonClass: '@',
    currentProject: '<',
    onChange: '&',
    isAuthenticated: '<',
  },
};

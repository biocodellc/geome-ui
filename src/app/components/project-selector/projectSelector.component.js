class ProjectSelectorController {
  constructor(ProjectService) {
    'ngInject';

    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.projects = [];
    this.isOpen = false;
    this.includePublicProjects = false;
    this.filterProjects();
  }

  $onChanges(changesObj) {
    if ('isAuthenticated' in changesObj) {
      this.includePublicProjects = !this.isAuthenticated;
      this.filterProjects();
    }

    if (changesObj.currentProject) {
      this.filterProjects();
    }
  }

  filterProjects() {
    // TODO can we define a schema on the User?
    // then we can return the ids of the projects a user is a member of, and make this a dumb component, just filtering here which is faster
    this.ProjectService.all(this.includePublicProjects).then(({ data }) => {
      // TODO if currentProject is not in filtered list & includePublicProjects === false,
      // make includePublicProjects === true
      this.projects = data;
    });
  }

  change(project) {
    this.onChange({ project });
    this.isOpen = false;
  }
}

export default {
  template: require('./projectSelector.html'),
  controller: ProjectSelectorController,
  bindings: {
    currentProject: '<',
    onChange: '&',
    isAuthenticated: '<',
  },
};

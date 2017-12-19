import angular from 'angular';

import projects from '../../views/project';

class ProjectSelectorController {
  constructor(Projects) {
    'ngInject';

    this.Projects = Projects;
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
    //TODO can we define a schema on the User?
    // then we can return the ids of the projects a user is a member of, and make this a dumb component, just filtering here which is faster
    this.Projects.all(this.includePublicProjects)
      .then(({ data }) => {
        //TODO if currentProject is not in filtered list & includePublicProjects === false,
        // make includePublicProjects === true
        this.projects = data
      });
  }

  change(project) {
    this.onChange({ project: project });
    this.isOpen = false;
  }
}

const projectSelector = {
  template: require('./projectSelector.html'),
  controller: ProjectSelectorController,
  bindings: {
    currentProject: "<",
    onChange: "&",
    isAuthenticated: "<",
  },
};

export default angular.module('fims.projectSelector', [ projects ])
  .component('projectSelector', projectSelector)
  .name;

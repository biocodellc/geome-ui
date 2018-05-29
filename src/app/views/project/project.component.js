import angular from 'angular';

const template = require('./project.html');

class ProjectCtrl {
  constructor($state, ProjectService) {
    'ngInject';

    this.$state = $state;
    this.ProjectService = ProjectService;
  }

  handleProjectUpdate(project) {
    if (!angular.equals(this.currentProject, project)) {
      this.ProjectService.update(project)
        .then(({ data }) => {
          angular.toaster.success('Successfully updated!');
          return this.ProjectService.setCurrentProject(data);
        })
        .then(() => this.$state.reload());
    } else {
      angular.toaster.success('Successfully updated!');
    }
  }
}

export default {
  template,
  controller: ProjectCtrl,
  bindings: {
    currentProject: '<',
    onProjectChange: '&',
  },
};

import angular from "angular";

class ProjectCtrl {
  constructor($state, ProjectService, alerts) {
    'ngInject';
    this.$state = $state;
    this.ProjectService = ProjectService;
    this.alerts = alerts;
  }

  handleProjectUpdate(project) {
    if (!angular.equals(this.currentProject, project)) {
      this.ProjectService.update(project)
        .then(({ data }) => {
          this.alerts.success("Successfully updated!");
          return this.ProjectService.setCurrentProject(data);
        })
        .then(() => this.$state.reload());
    } else {
      this.alerts.success("Successfully updated!");
    }
  }

}

export default {
  template: require('./project.html'),
  controller: ProjectCtrl,
  bindings: {
    currentProject: '<',
    onProjectChange: '&',
  },
};
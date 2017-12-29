import angular from "angular";

class ProjectCtrl {
  constructor($state, Projects, alerts) {
    'ngInject';
    this.$state = $state;
    this.Projects = Projects;
    this.alerts = alerts;
  }

  handleProjectUpdate(project) {
    if (!angular.equals(this.currentProject, project)) {
      this.Projects.update(project)
        .then(({ data }) => {
          this.alerts.success("Successfully updated!");
          return this.Projects.setCurrentProject(data);
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
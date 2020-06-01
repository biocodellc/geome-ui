/* eslint-disable no-return-assign */
import angular from 'angular';

const template = require('./project.html');

class ProjectCtrl {
  constructor($state, $mdDialog, ProjectService) {
    'ngInject';

    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.ProjectService = ProjectService;
  }

  handleProjectUpdate(project) {
    if (!angular.equals(this.currentProject, project)) {
      this.loadSave = true;
      this.ProjectService.update(project)
        .then(({ data }) => {
          angular.toaster.success('Successfully updated!');
          return this.ProjectService.setCurrentProject(data);
        })
        .finally(() => (this.loadSave = false));
    } else {
      angular.toaster.success('Successfully updated!');
    }
  }

  handleProjectDelete(project) {
    this.$mdDialog
      .show(
        this.$mdDialog
          .confirm()
          .htmlContent(
            `Are you sure you want to delete this project? All associated 
            expeditions and records will be lost.<br /><br />
            <strong>We recommend that you export all data before deleting</strong>.`,
          )
          .title('Delete Project?')
          .css('confirmation-dialog')
          .ok('Delete')
          .cancel('Cancel'),
      )
      .then(() => (this.loadDelete = true))
      .then(() => this.ProjectService.delete(project))
      .then(() => {
        angular.toaster.success('Successfully deleted project!');
      })
      .then(() => (this.loadDelete = false))
      .catch(() => {});
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

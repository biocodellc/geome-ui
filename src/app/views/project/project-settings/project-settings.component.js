const template = require('./project-settings.html');

class ProjectSettingsController {
  $onInit() {
    this.project = Object.assign({}, this.currentProject);
  }
}

export default {
  template,
  controller: ProjectSettingsController,
  bindings: {
    currentProject: '<',
    onProjectUpdate: '&',
    onProjectDelete: '&',
  },
};

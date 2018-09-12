const template = require('./project-info.html');

class ProjectInfoController {
  constructor($state, ProjectService) {
    'ngInject';

    this.$state = $state;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.ProjectService.all(true).then(({ data }) => (this.data = data));
  }
}

export default {
  template,
  controller: ProjectInfoController,
  bindings: {},
};

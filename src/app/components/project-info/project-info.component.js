import compareValues from '../../utils/compareValues';

const template = require('./project-info.html');

class ProjectInfoController {
  constructor($state, ProjectService) {
    'ngInject';

    this.$state = $state;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.loading = true;
    this.ProjectService.all(true)
      .then(({ data }) => (this.data = data))
      .then(() => this.data.sort(compareValues('projectTitle')))
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: ProjectInfoController,
  bindings: {},
};

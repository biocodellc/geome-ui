import compareValues from '../../utils/compareValues';

const template = require('./project-info.html');

class ProjectInfoController {
  constructor($state, ProjectConfigurationService) {
    'ngInject';

    this.$state = $state;
    this.ProjectConfigurationService = ProjectConfigurationService;
  }

  $onInit() {
    this.loading = true;
    this.ProjectConfigurationService.all(true)
      .then(data => {
        // sorting by description a bit of a hack to get generic configurations to sort at top
        // these configuratinos purposefully begin with early alphabet letters
        this.data = data.sort(compareValues('description'));
      })
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: ProjectInfoController,
  bindings: {},
};

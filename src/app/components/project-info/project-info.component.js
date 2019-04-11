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
      .then(( data ) => {
	// sorting by description a bit of a hack to get generic configurations to sort at top
	// these configuratinos purposefully begin with early alphabet letters 
        this.data = data.sort(sortByProperty('description'))
      })
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: ProjectInfoController,
  bindings: {},
};

/**
 * Generic array sorting
 *
 * @param property
 * @returns {Function}
 */
var sortByProperty = function (property) {
    return function (x, y) {
        return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
    };
};

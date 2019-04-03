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
        //this.data = data.filter(p => p.projectConfiguration.networkApproved);
	console.log(data)
        this.data = data
      })
      .finally(() => (this.loading = false));
  }
}

export default {
  template,
  controller: ProjectInfoController,
  bindings: {},
};

const template = require('./project-info.html');

class ProjectInfoController {
  constructor($state) {
    'ngInject';

    this.$state = $state;
  }
}

export default {
  template,
  controller: ProjectInfoController,
  bindings: {
  },
};

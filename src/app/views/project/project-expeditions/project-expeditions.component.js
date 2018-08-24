import FimsExpeditionController from '../../../components/expeditions/FimsExpeditionController';

const template = require('./project-expeditions.html');

class ProjectExpeditionsController extends FimsExpeditionController {
  constructor($state, ExpeditionService, DataService, QueryService, $uibModal) {
    'ngInject';

    super($state, $uibModal, ExpeditionService, DataService, QueryService);
  }

  deleteExpedition(expedition) {
    super
      .deleteExpedition(this.currentProject.projectId, expedition)
      .then(() => this.$state.reload());
  }
}

export default {
  template,
  controller: ProjectExpeditionsController,
  bindings: {
    expeditions: '<',
    currentProject: '<',
  },
};

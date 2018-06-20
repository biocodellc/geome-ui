import FimsExpeditionController from '../../../components/expeditions/FimsExpeditionController';

const template = require('./project-expeditions.html');

class ProjectExpeditionsController extends FimsExpeditionController {
  constructor($state, ExpeditionService, DataService, $uibModal) {
    'ngInject';

    super($uibModal, ExpeditionService, DataService);
    this.$state = $state;
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

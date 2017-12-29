import { FimsExpeditionController } from "../../../components/expeditions/FimsExpeditionController";

class ProjectExpeditionsController extends FimsExpeditionController {
  deleteExpedition(expedition) {
    super.deleteExpedition(expedition).then(() => this.$state.reload());
  }
}

export default {
  template: require('./project-expeditions.html'),
  controller: ProjectExpeditionsController,
  bindings: {
    expeditions: '<',
    currentProject: '<',
  },
};
import routing from "./routes";
import { FimsExpeditionController } from "../../../components/expeditions/FimsExpeditionController";
import fimsExpeditions from "../../../components/expeditions";
import fimsProjectExpedition from "../project-expedition";


class ProjectExpeditionsController extends FimsExpeditionController {
  deleteExpedition(expedition) {
    super.deleteExpedition(expedition).then(() => this.$state.reload());
  }
}

const fimsProjectExpeditions = {
  template: require('./project-expeditions.html'),
  controller: ProjectExpeditionsController,
  bindings: {
    expeditions: '<',
  },
};

export default angular.module('fims.projectExpeditions', [ fimsProjectExpedition, fimsExpeditions ])
  .run(routing)
  .component('fimsProjectExpeditions', fimsProjectExpeditions)
  .name;

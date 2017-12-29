import angular from "angular";
import { FimsExpeditionController } from "./FimsExpeditionController";
import dataService from '../../services/data.service';
import expeditionService from '../../services/expeditions.service';

export class ExpeditionController extends FimsExpeditionController {
  constructor($state, ExpeditionService, DataService, $uibModal) {
    'ngInject';
    super($uibModal, $state, ExpeditionService, DataService);
  }

  handleExpeditionUpdate(expedition) {
    if (!angular.equals(this.expedition, expedition)) {
      this.ExpeditionService.update(expedition)
        .then(() => {
          angular.alerts.success("Successfully updated!");
          this.$state.reload();
        });
    } else {
      angular.alerts.success("Successfully updated!");
    }
  }

  handleExpeditionDelete() {
    super.deleteExpedition(this.expedition)
      .then(() => this.$state.go(this.backState, {}, { reload: true, inherit: false }));
  }
}

const fimsExpedition = {
  template: require('./expedition.html'),
  controller: ExpeditionController,
  bindings: {
    backState: '<',
    expedition: '<',
    currentProject: '<',
  },
};

export default angular.module('fims.fimsExpedition', [ dataService, expeditionService ])
  .component('fimsExpedition', fimsExpedition)
  .name;

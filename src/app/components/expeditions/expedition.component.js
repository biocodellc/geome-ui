import angular from 'angular';
import FimsExpeditionController from './FimsExpeditionController';
import dataService from '../../services/data.service';
import expeditionService from '../../services/expedition.service';

const template = require('./expedition.html');

export class ExpeditionController extends FimsExpeditionController {
  constructor($state, ExpeditionService, DataService, QueryService, $uibModal) {
    'ngInject';

    super($state, $uibModal, ExpeditionService, DataService, QueryService);
  }

  viewData() {
    this.$state.go('query', {
      q: `_projects_:${this.currentProject.projectId} and _expeditions_:[${
        this.expedition.expeditionCode
      }]`,
    });
  }

  handleExpeditionUpdate(expedition) {
    if (!angular.equals(this.expedition, expedition)) {
      this.ExpeditionService.update(
        this.currentProject.projectId,
        expedition,
      ).then(e => {
        angular.toaster.success('Successfully updated!');
        this.$state.reload();
      });
    } else {
      angular.toaster.success('Successfully updated!');
    }
  }

  handleExpeditionDelete() {
    super
      .deleteExpedition(this.currentProject.projectId, this.expedition)
      .then(() =>
        this.$state.go(this.backState, {}, { reload: true, inherit: false }),
      );
  }
}

const fimsExpedition = {
  template,
  controller: ExpeditionController,
  bindings: {
    backState: '<',
    expedition: '<',
    currentProject: '<',
  },
};

export default angular
  .module('fims.fimsExpedition', [dataService, expeditionService])
  .component('fimsExpedition', fimsExpedition).name;

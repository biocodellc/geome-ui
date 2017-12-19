import routing from "./routes";

class DeleteConfirmationController {
  constructor($uibModalInstance, expeditionCode) {
    this.expeditionCode = expeditionCode;
    this.delete = $uibModalInstance.close;
    this.cancel = $uibModalInstance.dismiss;
  }
}


class ProjectExpeditionsController {
  constructor($uibModal, $state, ExpeditionService, DataService) {
    'ngInject';

    this.$uibModal = $uibModal;
    this.$state = $state;
    this.ExpeditionService = ExpeditionService;
    this.DataService = DataService;
  }

  exportData(expedition) {
    this.DataService.exportData(expedition.expeditionCode);
  }

  deleteExpedition(expedition) {
    const modal = this.$uibModal.open({
      template: require('../../../components/expeditions/delete-confirmation.tpl.html'),
      size: 'md',
      controller: DeleteConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
      resolve: {
        expeditionCode: () => expedition.expeditionCode,
      },
    });

    modal.result.then(() =>
      this.ExpeditionService.delete(expedition)
        .then(() => this.$state.reload()),
    );
  }

  _getExpeditions() {
    this.ExpeditionService.all()
      .then(({ data }) => {
        this.expeditions = data
      });
  }

}

const fimsProjectExpeditions = {
  template: require('./project-expeditions.html'),
  controller: ProjectExpeditionsController,
  bindings: {
    expeditions: '<',
  },
};

export default angular.module('fims.projectExpeditions', [])
  .run(routing)
  .component('fimsProjectExpeditions', fimsProjectExpeditions)
  .name;

const template = require('./delete-confirmation.tpl.html');

class DeleteConfirmationController {
  constructor($uibModalInstance, expeditionCode) {
    'ngInject';

    this.expeditionCode = expeditionCode;
    this.delete = $uibModalInstance.close;
    this.cancel = $uibModalInstance.dismiss;
  }
}

export default class FimsExpeditionController {
  constructor($uibModal, ExpeditionService, DataService) {
    'ngInject';

    this.$uibModal = $uibModal;
    this.ExpeditionService = ExpeditionService;
    this.DataService = DataService;
  }

  exportData(projectId, expedition) {
    this.DataService.exportData(projectId, expedition.expeditionCode);
  }

  deleteExpedition(projectId, expedition) {
    const modal = this.$uibModal.open({
      template,
      size: 'md',
      controller: DeleteConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
      resolve: {
        expeditionCode: () => expedition.expeditionCode,
      },
    });

    return modal.result.then(() =>
      this.ExpeditionService.delete(projectId, expedition),
    );
  }
}

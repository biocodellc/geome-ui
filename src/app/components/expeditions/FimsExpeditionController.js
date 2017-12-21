export class FimsExpeditionController {
  constructor($uibModal, $state, ExpeditionService, DataService) {
    'ngInject';

    this.$uibModal = $uibModal;
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

    return modal.result.then(() =>
      this.ExpeditionService.delete(expedition)
    );
  }
}

class DeleteConfirmationController {
  constructor($uibModalInstance, expeditionCode) {
    'ngInject';
    this.expeditionCode = expeditionCode;
    this.delete = $uibModalInstance.close;
    this.cancel = $uibModalInstance.dismiss;
  }
}
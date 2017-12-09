class ProjectExpeditionsController {
  constructor($uibModal, ExpeditionService, DataService, expeditions) {
    this.expeditions = expeditions;

    this.$uibModal = $uibModal;
    this.ExpeditionService = ExpeditionService;
    this.DataService = DataService;
  }

  exportData(expedition) {
    this.DataService.export(expedition.expeditionCode);
  }

  deleteExpedition(expedition) {
    const modal = this.$uibModal.open({
      templateUrl: require('../expeditions/delete-confirmation.tpl.html'),
      size: 'md',
      controller: DeleteConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
      resolve: {
        expeditionCode: function () {
          return expedition.expeditionCode;
        },
      },
    });

    modal.result.then(() =>
      this.ExpeditionService.delete(expedition)
        .then(() => this._getExpeditions()),
    );
  }

  _getExpeditions() {
    this.ExpeditionService.all()
      .then(({ data }) => this.expeditions = data);
  }

}

ProjectExpeditionsController.$inject = [ '$uibModal', 'ExpeditionService', 'DataService', 'expeditions' ];

export default ProjectExpeditionsController;

// TODO might need to call .controller('DeleteConfirmationController', DeleteCon....
class DeleteConfirmationController {
  constructor($uibModalInstance, expeditionCode) {
    this.expeditionCode = expeditionCode;
    this.delete = $uibModalInstance.close;
    this.cancel = $uibModalInstance.dismiss;
  }
}

DeleteConfirmationController.$inject = [ '$uibModalInstance', 'expeditionCode' ];

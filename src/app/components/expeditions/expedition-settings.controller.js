export default class ExpeditionSettingsController {
  constructor($state, $uibModal, alerts, ExpeditionService, expedition, backState) {
    'ngInject';

    this.$state = $state;
    this.$uibModal = $uibModal;
    this.alerts = alerts;
    this.ExpeditionService = ExpeditionService;
    this.backState = backState;

    this.expedition = expedition;
    this.editExpedition = angular.copy(expedition);
    this.visibilities = [ "anyone", "project members", "expedition members" ];

  }

  update() {
    if (!angular.equals(this.expedition, this.editExpedition)) {
      this.ExpeditionService.update(this.editExpedition)
        .then(() => {
          this.alerts.success("Successfully updated!");
          Object.assign(this.expedition, this.editExpedition);
        });
    } else {
      this.alerts.success("Successfully updated!");
    }
  }

  deleteExpedition() {
    const modal = this.$uibModal.open({
      templateUrl: require('delete-confirmation.tpl.html'),
      size: 'md',
      controller: DeleteConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
      resolve: {
        expeditionCode: () => {
          return this.expedition.expeditionCode;
        },
      },
    });

    modal.result
      .then(() => this.ExpeditionService.delete(this.expedition))
      .then(() => this.$state.go(this.backState, {}, { reload: true, inherit: false }));
  }
}


class DeleteConfirmationController {
  constructor($uibModalInstance, expeditionCode) {
    this.expeditionCode = expeditionCode;
    this.delete = $uibModalInstance.close;
    this.cancel = $uibModalInstance.dismiss;
  }
}

DeleteConfirmationController.$inject = [ '$uibModalInstance', 'expeditionCode' ];

import routing from "./routes";

class ProjectSettingsController {
  $onInit() {
    this.project = Object.assign({}, this.currentProject);
  }

  //
  // function deleteProject() {
  //     var modal = $uibModal.open({
  //         templateUrl: 'app/components/expeditions/delete-confirmation.tpl.html',
  //         size: 'md',
  //         controller: _deleteConfirmationController,
  //         controllerAs: 'this',
  //         windowClass: 'app-modal-window',
  //         backdrop: 'static',
  //         resolve: {
  //             expeditionCode: function () {
  //                 return this.expedition.expeditionCode;
  //             }
  //         }
  //     });
  //
  //     modal.result.then(
  //         function() {
  //             ProjectService.delete(this.expedition)
  //                 .then(function() {
  //                     $state.go('expeditions.list', {}, {reload:true, inherit: false});
  //                 });
  //         }
  //     );
  // }
  //
  // _deleteConfirmationController.$inject = ['$uibModalInstance', 'expeditionCode'];
  //
  // function _deleteConfirmationController($uibModalInstance, expeditionCode) {
  //     var this = this;
  //     this.expeditionCode = expeditionCode;
  //     this.delete = $uibModalInstance.close;
  //     this.cancel = $uibModalInstance.dismiss;
  // }
}

const fimsProjectSettings = {
  template: require('./project-settings.html'),
  controller: ProjectSettingsController,
  bindings: {
    currentProject: '<',
    onProjectUpdate: '&',
  }
};

export default angular.module('fims.projectSettings', [])
  .run(routing)
  .component('fimsProjectSettings', fimsProjectSettings)
  .name;

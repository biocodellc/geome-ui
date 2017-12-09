class ProjectSettingsController {
  constructor($rootScope, alerts, ProjectService) {
    this.project = ProjectService.currentProject;
    this.editProject = Object.assign({}, this.project);

    this.alerts = alerts;
    this.ProjectService = ProjectService;

    // $rootScope.$on('$projectChangeEvent', function(event, project) {
    //     this.project =  project;
    //     this.editProject = angular.copy(project);
    // });
  }

  update() {
    if (!angular.equals(this.project, this.editProject)) {
      this.ProjectService.update(this.editProject)
        .then((response) => {
          this.alerts.success("Successfully updated!");
          this.ProjectService.set(response.data);
        });
    } else {
      this.alerts.success("Successfully updated!");
    }
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

ProjectSettingsController.$inject = [ '$rootScope', 'alerts', 'ProjectService' ];

export default ProjectSettingsController;

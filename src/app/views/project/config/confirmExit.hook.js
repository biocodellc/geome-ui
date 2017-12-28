function configConfirmationController($uibModalInstance) {
  'ngInject';
  var vm = this;
  vm.continue = $uibModalInstance.close;
  vm.cancel = $uibModalInstance.dismiss;
}

export default ($transitions, $state, $uibModal, Projects, ProjectConfigService, alerts) => {
  'ngInject';

  // If there are unsaved changes to the project configuration
  // ask the user if they would like to save before transitioning
  // to a new page
  $transitions.onExit({ exiting: 'project.config' }, () => {
    const state = $state.get('project.config');
    if (state.data && state.data.config) {
      const modal = $uibModal.open({
        template: require('./unsaved-config-confirmation.html'),
        size: 'md',
        controller: configConfirmationController,
        controllerAs: 'vm',
        windowClass: 'app-modal-window',
        backdrop: 'static',
      });

      // TODO show a loading indicator when the config is being saved
      return modal.result.then(shouldSave => {
        if (shouldSave) {
          return ProjectConfigService.save(state.data.config, Projects.currentProject().projectId)
            .then((config) => {
              // TODO this doesn't appear to be returning the correct config object
              console.log(config);
              Projects.currentProject().config = config;
              alerts.success("Successfully updated project configuration!")
            })
            .catch((response) => {
              if (response.status === 400) {
                response.data.errors.forEach(error => this.alerts.error(error));
              } else {
                this.alerts.error("Error saving project configuration!");
              }

              return false;
            });
        }
      }).then((res) => {
        delete state.data.config;
        return res;
      });
    }
  });
}


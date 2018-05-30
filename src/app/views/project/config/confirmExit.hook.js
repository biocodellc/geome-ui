import angular from 'angular';
import displayConfigErrors from '../../../utils/displayConfigErrors';

const template = require('./unsaved-config-confirmation.html');

function configConfirmationController($uibModalInstance) {
  'ngInject';

  const vm = this;
  vm.continue = $uibModalInstance.close;
  vm.cancel = $uibModalInstance.dismiss;
}

export default (
  $transitions,
  $state,
  $uibModal,
  $mdDialog,
  ProjectService,
  ProjectConfigService,
) => {
  'ngInject';

  // If there are unsaved changes to the project configuration
  // ask the user if they would like to save before transitioning
  // to a new page
  // TODO use https://ui-router.github.io/ng1/docs/latest/interfaces/ng1.ng1controller.html#uicanexit instead?
  $transitions.onExit({ exiting: 'project.config' }, transition => {
    const state = $state.get('project.config');
    if (state.data && state.data.config) {
      const modal = $uibModal.open({
        template,
        size: 'md',
        controller: configConfirmationController,
        controllerAs: 'vm',
        windowClass: 'app-modal-window',
        backdrop: 'static',
      });

      // TODO show a loading indicator when the config is being saved
      return modal.result
        .then(shouldSave => {
          if (shouldSave) {
            return ProjectConfigService.save(
              state.data.config,
              ProjectService.currentProject().projectId,
            )
              .then(config => {
                ProjectService.currentProject().config = config;
                angular.toaster.success(
                  'Successfully updated project configuration!',
                );
                return true;
              })
              .catch(response => {
                if (response.status === 400) {
                  displayConfigErrors($mdDialog, response.data.errors);
                } else {
                  angular.toaster.error('Error saving project configuration!');
                }

                return false;
              });
          }
          return true;
        })
        .then(res => {
          if (res) delete state.data.config;
          return res;
        });
    }
  });
};

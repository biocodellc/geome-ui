import angular from 'angular';
import ProjectConfig from '../../../models/ProjectConfig';
import displayConfigErrors from '../../../utils/displayConfigErrors';

const template = require('./config.html');

//if user changes project configuration, and tries to exit without saving 
//show this modal instance 
function configConfirmationController($uibModalInstance) {
  'ngInject';

  const vm = this;
  vm.continue = $uibModalInstance.close;
  vm.cancel = $uibModalInstance.dismiss;
}

class ConfigController {
  constructor($state, $uibModal, $mdDialog, $transitions, ProjectConfigService, ProjectService) {
    'ngInject';

    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.$transitions = $transitions;
    this.ProjectConfigService = ProjectConfigService;
    this.ProjectService = ProjectService;
    this.$uibModal = $uibModal;
  }

  $onInit() {
    this.showSave = false;
    this.config = new ProjectConfig(this.currentProject.config);
    this.projectConfigState = this.$state.get('project.config');

    if (!this.projectConfigState.data) {
      this.projectConfigState.data = {};
    }
  }

  updateStateData() {
    this.showSave = !angular.equals(this.currentProject.config, this.config);
    if (this.showSave) {
      this.projectConfigState.data.config = this.config;
    } else {
      delete this.projectConfigState.data.config;
    }
  }

  handleUpdateEntities(entities) {
    this.config.entities = entities;
    this.updateStateData();
  }

  handleUpdateEntity(alias, entity) {
    const i = this.config.entities.findIndex(e => e.conceptAlias === alias);
    this.config.entities.splice(i, 1, entity);
    this.updateStateData();
  }

  handleUpdateLists(lists) {
    this.config.lists = lists;
    this.updateStateData();
  }

  handleUpdateList(alias, list) {
    const i = this.config.lists.findIndex(l => l.alias === alias);
    this.config.lists.splice(i, 1, list);
    this.updateStateData();
  }

  handleUpdateMetadata(config) {
    delete config.entities;
    delete config.lists;
    Object.assign(this.config, config);
    this.updateStateData();
  }

  handleNewWorksheet(sheetName) {
    this.config.addWorksheet(sheetName);
    // this.showSave = true;
    this.updateStateData();
  }

  handleUpdateExpeditionMetadata(expeditionMetadata) {
    this.config.expeditionMetadataProperties = expeditionMetadata;
    this.updateStateData();
  }

  handleOnSave() {
    this.loading = true;
    this.ProjectConfigService.save(this.config, this.currentProject.projectId)
      .then(config => {
        this.currentProject.config = config;
        angular.toaster.success('Successfully updated project configuration!');
        this.config = new ProjectConfig(config);
        this.updateStateData();
      })
      .catch(response => {
        if (response.status === 400) {
          displayConfigErrors(this.$mdDialog, response.data.errors);
        } else {
          angular.toaster.error('Error saving project configuration!');
        }
      })
      .then(() => { this.loading = false });
  }

  // exit hook to catch if there are unsaved changes to the project configuration
  uiCanExit() {
    this.$transitions.onExit({ exiting: 'project.config' }, transition => {
      const state = this.$state.get('project.config');
      if (state.data && state.data.config) {
        const modal = this.$uibModal.open({
          template: require('./unsaved-config-confirmation.html'),
          size: 'md',
          controller: configConfirmationController,
          controllerAs: 'vm',
          windowClass: 'app-modal-window',
          backdrop: 'static',
        }); //these cancel and continue options are defined in configConfirmationController above 

        //TODO: the modal sometimes appears more than once, and on save and continue,
        //doesn't function the first time 
        return modal.result
          .then(shouldSave => {
            if (shouldSave) {
              this.loading = true;
              return this.ProjectConfigService.save(
                state.data.config,
                this.ProjectService.currentProject().projectId,
              )
                .then(config => {
                  this.ProjectService.currentProject().config = config;
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

          .then(() => { this.loading = false })
          .then(res => {
            if (res) delete state.data.config;
            return res;
          })
      }
    });
  }
}

export default {
  template,
  controller: ConfigController,
  bindings: {
    currentProject: '<',
  },
};

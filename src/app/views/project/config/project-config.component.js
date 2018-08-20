import angular from 'angular';
import ProjectConfig from '../../../models/ProjectConfig';
import displayConfigErrors from '../../../utils/displayConfigErrors';

const template = require('./config.html');

function configConfirmationController($mdDialog) {
  'ngInject';

  const vm = this;

  vm.continue = $mdDialog.hide;
  vm.cancel = $mdDialog.cancel;
}

class ConfigController {
  constructor($mdDialog, ProjectConfigService) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.ProjectConfigService = ProjectConfigService;
  }

  $onInit() {
    this.showSave = false;
    this.config = new ProjectConfig(this.currentProject.config);
  }

  updateShowSave() {
    this.showSave = !angular.equals(this.currentProject.config, this.config);
  }

  handleUpdateEntities(entities) {
    this.config.entities = entities;
    this.updateShowSave();
  }

  handleUpdateEntity(alias, entity) {
    const i = this.config.entities.findIndex(e => e.conceptAlias === alias);
    this.config.entities.splice(i, 1, entity);
    this.updateShowSave();
  }

  handleUpdateLists(lists) {
    this.config.lists = lists;
    this.updateShowSave();
  }

  handleUpdateList(alias, list) {
    const i = this.config.lists.findIndex(l => l.alias === alias);
    this.config.lists.splice(i, 1, list);
    this.updateShowSave();
  }

  handleUpdateMetadata(config) {
    delete config.entities;
    delete config.lists;
    Object.assign(this.config, config);
    this.updateShowSave();
  }

  handleNewWorksheet(sheetName) {
    this.config.addWorksheet(sheetName);
    // this.showSave = true;
    this.updateShowSave();
  }

  handleUpdateExpeditionMetadata(expeditionMetadata) {
    this.config.expeditionMetadataProperties = expeditionMetadata;
    this.updateShowSave();
  }

  handleOnSave() {
    this.loading = true;
    return this.ProjectConfigService.save(
      this.config,
      this.currentProject.projectId,
    )
      .then(config => {
        this.currentProject.config = config;
        angular.toaster.success('Successfully updated project configuration!');
        this.config = new ProjectConfig(config);
        this.updateShowSave();
      })
      .catch(response => {
        if (response.status === 400) {
          displayConfigErrors(this.$mdDialog, response.data.errors);
        } else {
          angular.toaster.error('Error saving project configuration!');
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  uiCanExit() {
    if (this.showSave) {
      return this.$mdDialog
        .show({
          template: require('./unsaved-config-confirmation.html'),
          controller: configConfirmationController,
          controllerAs: 'vm',
        })
        .then(shouldSave => {
          if (shouldSave) {
            return this.handleOnSave();
          }
        });
    }
  }
}

export default {
  template,
  controller: ConfigController,
  bindings: {
    currentProject: '<',
  },
};

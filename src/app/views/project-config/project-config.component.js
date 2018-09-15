import angular from 'angular';
import ProjectConfig from '../../models/ProjectConfig';
import displayConfigErrors from '../../utils/displayConfigErrors';

const template = require('./config.html');
const unsavedConfigConfirmationTemplate = require('./unsaved-config-confirmation.html');

function configConfirmationController($mdDialog) {
  'ngInject';

  const vm = this;

  vm.continue = $mdDialog.hide;
  vm.cancel = $mdDialog.cancel;
}

class ConfigController {
  constructor($mdDialog, ProjectConfigurationService) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.ProjectConfigurationService = ProjectConfigurationService;
  }

  $onInit() {
    this.showSave = false;
    this.loading = true;

    this.ProjectConfigurationService.get(
      this.currentProject.projectConfiguration.id,
    )
      .then(configuration => {
        this.config = new ProjectConfig(configuration.config);
        this.configuration = configuration;
      })
      .finally(() => (this.loading = false));
  }

  updateShowSave() {
    this.showSave = !angular.equals(this.configuration.config, this.config);
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
    return this.ProjectConfigurationService.save(
      Object.assign({}, this.configuration, { config: this.config }),
    )
      .then(configuration => {
        this.configuration = configuration;
        angular.toaster.success('Successfully updated project configuration!');
        this.config = new ProjectConfig(configuration.config);
        this.updateShowSave();
      })
      .catch(response => {
        if (response.status === 400) {
          displayConfigErrors(this.$mdDialog, response.data.config.errors);
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
          template: unsavedConfigConfirmationTemplate,
          controller: configConfirmationController,
          controllerAs: 'vm',
        })
        .then(shouldSave => {
          if (shouldSave) {
            return this.handleOnSave();
          }
        });
    }
    return Promise.resolve();
  }
}

export default {
  template,
  controller: ConfigController,
  bindings: {
    currentProject: '<',
  },
};

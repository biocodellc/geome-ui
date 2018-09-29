import angular from 'angular';
import ProjectConfig from '../../models/ProjectConfig';
import displayConfigErrors from '../../utils/displayConfigErrors';

const template = require('./config.html');
const unsavedConfigConfirmationTemplate = require('./unsaved-config-confirmation.html');

class ConfigController {
  constructor($mdDialog, $transitions, ProjectConfigurationService) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.ProjectConfigurationService = ProjectConfigurationService;

    // show spinner on transitions
    $transitions.onStart({ to: 'project-config.entities.**' }, trans => {
      const hasResolvables = s => {
        if (s.resolvables.length > 0) return true;
        if (!s.parent) return false;
        return hasResolvables(s.parent);
      };

      if (hasResolvables(trans.$to())) this.loading = true;
    });
    const finished = () => {
      this.loading = false;
    };
    $transitions.onFinish({ to: 'project-config.entities.**' }, finished);
    $transitions.onError({ to: 'project-config.entities.**' }, finished);
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
        this.name = configuration.name;
        this.description = configuration.description;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  updateShowSave() {
    this.showSave =
      !angular.equals(this.configuration.config, this.config) ||
      this.name !== this.configuration.name ||
      this.description !== this.configuration.description;
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

  handleUpdateSettings(configuration) {
    delete configuration.config;
    Object.assign(this.configuration, configuration);
    this.updateShowSave();
  }

  handleNewWorksheet(sheetName) {
    this.config.addWorksheet(sheetName);
    this.updateShowSave();
  }

  handleUpdateExpeditionMetadata(properties) {
    this.config.expeditionMetadataProperties = properties;
    this.updateShowSave();
  }

  onSave() {
    this.saving = true;
    return this.ProjectConfigurationService.save(
      Object.assign({}, this.configuration, { config: this.config }),
    )
      .then(configuration => {
        this.configuration = configuration;
        this.name = configuration.name;
        this.description = configuration.description;
        angular.toaster.success('Successfully updated project configuration!');
        this.config = new ProjectConfig(configuration.config);
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
        this.saving = false;
      });
  }

  uiCanExit() {
    if (this.showSave) {
      return this.$mdDialog
        .show({
          locals: {
            $mdDialog: this.$mdDialog,
          },
          template: unsavedConfigConfirmationTemplate,
          bindToController: true,
          controller: function Controller() {},
          controllerAs: '$ctrl',
        })
        .then(shouldSave => {
          if (shouldSave) {
            return this.onSave();
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

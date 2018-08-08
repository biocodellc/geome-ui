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
  constructor($state, $mdDialog, ProjectConfigService) {
    'ngInject';

    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.ProjectConfigService = ProjectConfigService;
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
      .finally(() => {
        this.loading = false;
      });
  }

  uiCanExit() { 
    const state = this.$state.get('project.config');
    if (state.data && state.data.config) {
	    return this.$mdDialog.show({
		template: require('./unsaved-config-confirmation.html'),
          	controller: configConfirmationController,
		controllerAs: 'vm',
	//	onComplete: function loadingIndicator(){loading=true}
	    })
	    .then(shouldSave => {
		  if (shouldSave) {
			  this.handleOnSave()
		  }
	    })
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

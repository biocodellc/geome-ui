import angular from 'angular';
import CreateExpeditionController, {
  createExpeditionTemplate,
} from '../../components/expeditions/CreateExpeditionController';

const template = require('./expeditions.html');

class expeditionsListController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  createExpedition() {
    this.$mdDialog
      .show({
        template: createExpeditionTemplate,
        locals: {
          metadataProperties: this.currentProject.config
            .expeditionMetadataProperties,
          projectId: this.currentProject.projectId,
        },
        bindToController: true,
        controller: CreateExpeditionController,
        controllerAs: '$ctrl',
        autoWrap: false,
      })
      .then(expedition => {
        this.expeditions = this.expeditions.concat([expedition]);
      })
      .catch(() => {});
  }
}

const fimsExpeditionsList = {
  template,
  controller: expeditionsListController,
  bindings: {
    expeditions: '<',
    currentUser: '<',
    currentProject: '<',
  },
};

export default angular
  .module('fims.fimsExpeditionsList', [])
  .component('fimsExpeditionsList', fimsExpeditionsList).name;

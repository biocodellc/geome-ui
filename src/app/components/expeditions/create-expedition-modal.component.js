import angular from 'angular';
import visibilities from './ExpeditionVisibilities';

const template = require('./create-expedition-modal.html');

class CreateExpeditionModalController {
  constructor($scope, ExpeditionService) {
    'ngInject';

    this.$scope = $scope;
    this.ExpeditionService = ExpeditionService;
  }

  $onInit() {
    this.visibilities = visibilities;
    // we have to do the following b/c uibModal doesn't resolve correctly
    this.metadataProperties = this.resolve.metadataProperties;
    this.expedition = {
      expeditionTitle: '',
      expeditionCode: '',
      visibility: visibilities[0],
      metadata: {},
    };
  }

  expeditionCodeChanged() {
    if (
      this.invalidExpeditionCode &&
      this.expedition.expeditionCode === this.invalidExpeditionCode
    ) {
      this.form.expeditionCode.$setValidity('exists', false);
    } else if (this.form.expeditionCode.$error.exists) {
      this.form.expeditionCode.$setValidity('exists', true);
    }
  }

  submit() {
    this.$scope.$broadcast('show-errors-check-validity');

    if (this.form.$invalid) return;

    this.ExpeditionService.create(this.resolve.projectId, this.expedition)
      .then(({ data }) => this.close({ $value: data }))
      .catch(response => {
        if (response.status === 400) {
          this.form.expeditionCode.$setValidity('exists', false);
          this.invalidExpeditionCode = this.expedition.expeditionCode;
        }
      });
  }
}

const component = {
  template,
  controller: CreateExpeditionModalController,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
};

export default angular
  .module('fims.fimsCreateExpeditionModal', [])
  .component('fimsCreateExpeditionModal', component).name;

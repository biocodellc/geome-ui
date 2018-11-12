import visibilities from './ExpeditionVisibilities';

export const createExpeditionTemplate = require('./create-expedition-modal.html');

export default class CreateExpeditionController {
  constructor($mdDialog, ExpeditionService) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.ExpeditionService = ExpeditionService;
  }

  $onInit() {
    this.visibilities = visibilities;
    this.expedition = {
      expeditionTitle: '',
      expeditionCode: '',
      visibility: visibilities[0],
      public: true,
      metadata: {},
    };
  }

  submit() {
    if (this.form.$invalid) return;

    this.loading = true;
    this.ExpeditionService.create(this.projectId, this.expedition)
      .then(({ data }) => this.$mdDialog.hide(data))
      .catch(response => {
        if (response.status === 400) {
          this.form.expeditionCode.$setValidity('exists', false);
          this.invalidExpeditionCode = this.expedition.expeditionCode;
        }
        this.loading = false;
      });
  }
}

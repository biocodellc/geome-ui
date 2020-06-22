const template = require('./amphibian-disease-form.html');

class AmphibianDiseaseFormController {
  constructor() {
    'ngInject';

  }

  $onInit() {
    this.boolean = [{ value: 'true' }, { value: 'false' }];
    this.diseaseTestedList = this.configuration.config.getList(
      'diseaseTested',
    ).fields;
    this.diseaseDetectedList = this.configuration.config.getList(
      'diseaseDetected',
    ).fields;
  }
}

export default {
  template,
  controller: AmphibianDiseaseFormController,
  bindings: {
    configuration: '<',
    params: '<',
  },
};

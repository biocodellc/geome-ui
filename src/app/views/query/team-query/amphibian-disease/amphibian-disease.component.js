const template = require('./amphibian-disease.html');

class AmphibianDiseaseController {
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
  controller: AmphibianDiseaseController,
  bindings: {
    configuration: '<',
    params: '<',
  },
};

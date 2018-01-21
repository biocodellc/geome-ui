import angular from 'angular';


import fimsValidationResults from './validationResults.component';
import fimsValidationMessages from './validationMessages.component';
import fimsResults from './results.component';
import fimsResultsModal from './resultsModal.component.js';

export default angular.module('fims.validationResults', [])
  .component('fimsValidationResults', fimsValidationResults)
  .component('fimsResults', fimsResults)
  .component('fimsValidationMessages', fimsValidationMessages)
  .component('fimsResultsModal', fimsResultsModal)
  .name;

/* eslint-disable class-methods-use-this */
import angular from 'angular';

const template = require('./validationResults.html');

class ValidationResultsController {
  isEmptyObject(obj) {
    return angular.equals({}, obj);
  }
}

export default {
  template,
  controller: ValidationResultsController,
  bindings: {
    results: '<',
  },
};

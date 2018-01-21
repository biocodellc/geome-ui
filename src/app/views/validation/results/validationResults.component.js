class ValidationResultsController {
  isEmptyObject(obj) {
    return angular.equals({}, obj);
  }
}

export default {
  template: require('./validationResults.html'),
  controller: ValidationResultsController,
  bindings: {
    results: "<",
  },
};

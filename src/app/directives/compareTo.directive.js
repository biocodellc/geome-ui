import angular from 'angular';

const compareTo = () => ({
  restrict: 'A',
  require: 'ngModel',
  scope: {
    compareTo: '=compareTo',
  },
  link(scope, elm, attr, ngModel) {
    ngModel.$validators.compareTo = function(modelValue) {
      return modelValue === scope.compareTo;
    };

    scope.$watch('compareTo', () => {
      ngModel.$validate();
    });
  },
});

export default angular
  .module('fims.compareTo', [])
  .directive('compareTo', compareTo).name;

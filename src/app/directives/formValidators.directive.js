import angular from 'angular';

/**
 * custom form validator to compare model to another value
 */
const compareTo = () => ({
  restrict: 'A',
  require: 'ngModel',
  scope: {
    compareTo: '=compareTo',
  },
  link(scope, elm, attr, ctrl) {
    ctrl.$validators.compareTo = modelValue => modelValue === scope.compareTo;

    scope.$watch('compareTo', () => {
      ctrl.$validate();
    });
  },
});

/**
 * Custom form validator for username
 */
const username = /* ngInject */ UserService => ({
  restrict: 'A',
  require: 'ngModel',
  link: (scope, element, attrs, ctrl) => {
    ctrl.$asyncValidators.username = modelValue => {
      if (ctrl.$isEmpty(modelValue)) return true;

      return UserService.get(modelValue).then(user => {
        // user exists
        // rejected promises are invalid
        if (user) throw new Error();
      });
    };
  },
});

/**
 * Custom form validator for projectTitle
 */
const projectTitle = /* ngInject */ ProjectService => ({
  restrict: 'A',
  require: 'ngModel',
  link: (scope, element, attrs, ctrl) => {
    ctrl.$asyncValidators.projectTitle = modelValue => {
      if (ctrl.$isEmpty(modelValue)) return true;

      return ProjectService.find(true, modelValue).then(({ data }) => {
        // rejected promises are invalid
        if (data.length > 0) throw new Error();
      });
    };
  },
});

export default angular
  .module('fims.formValidators', [])
  .directive('compareTo', compareTo)
  .directive('username', username)
  .directive('projectTitle', projectTitle).name;

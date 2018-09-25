import angular from 'angular';

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
  .directive('projectTitle', projectTitle).name;

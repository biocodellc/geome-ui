import angular from 'angular';

/**
 * extend material-stepper mdStep directive placing the mdStep
 * controller on the scope as $mdStep
 */
const mdStep = $timeout => {
  'ngInject';

  return {
    restrict: 'E',
    require: 'mdStep', // require material-stepper mdStep
    link: (scope, element, attrs, ctrl) => {
      scope.$mdStep = ctrl;
      scope.$watch(
        () => ctrl.isActive(),
        isActive => {
          if (isActive) {
            // scroll after the step has rendered
            $timeout(() => {
              element[0].scrollIntoView();
            });
          }
        },
      );
    },
  };
};

export default angular
  .module('fims.mdStep', ['mdSteppers'])
  .directive('mdStep', mdStep).name;

import angular from 'angular';

/**
 * extend material-stepper mdStepper directive
 */
const mdStepper = () => {
  'ngInject';

  return {
    restrict: 'E',
    require: 'mdStepper', // require material-stepper mdStepper
    link: (scope, element, attrs, ctrl) => {
      // can't use scope b/c we're extending an existing directive
      const mdPreventSkip = scope.$eval(attrs.mdPreventSkip);
      if (mdPreventSkip) {
        const origGoto = ctrl.goto;
        ctrl.goto = stepNum => {
          if (stepNum <= ctrl.currentStep) {
            origGoto.call(ctrl, stepNum);
          }
        };
      }
    },
  };
};

export default angular
  .module('fims.mdStepper', ['mdSteppers'])
  .directive('mdStepper', mdStepper).name;

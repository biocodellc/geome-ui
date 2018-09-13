import angular from 'angular';

/**
 * extend material-stepper mdStep directive placing the mdStep
 * controller on the scope as $mdStep
 */
const mdStep = () => {
  'ngInject';

  return {
    restrict: 'E',
    require: 'mdStep', // require material-stepper mdStep
    link: (scope, element, attrs, ctrl) => {
      scope.$mdStep = ctrl;
    },
  };
};

export default angular
  .module('fims.mdStep', ['mdSteppers'])
  .directive('mdStep', mdStep).name;

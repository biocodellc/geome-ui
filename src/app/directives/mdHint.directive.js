import angular from 'angular';

const mdHint = () => {
  'ngInject';

  return {
    restrict: 'E',
    link: (scope, element) => {
      element.addClass('hint');
    },
  };
};

const mdHints = () => {
  'ngInject';

  return {
    restrict: 'E',
    link: (scope, element) => {
      const parent = element.parent();
      if (parent.find('[ng-messages]').length === 0) {
        element.addClass('no-ng-messages');
      }
    },
  };
};

export default angular
  .module('fims.mdHint', [])
  .directive('mdHint', mdHint)
  .directive('mdHints', mdHints).name;

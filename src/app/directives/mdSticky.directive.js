import angular from 'angular';

const mdSticky = ($compile, $mdSticky) => {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    template: '<div class="md-sticky-content"></div>',
    compile: (el, attrs, transclude) => (scope, element) => {
      const { outerHTML } = element[0];
      transclude(scope, clone => {
        element.append(clone);
      });

      transclude(scope, clone => {
        const stickyClone = $compile(
          angular.element(outerHTML).removeAttr('md-sticky'),
        )(scope);
        stickyClone.append(clone);
        $mdSticky(scope, element, stickyClone);
      });
    },
  };
};

export default angular
  .module('fims.mdSticky', [])
  .directive('mdSticky', mdSticky).name;

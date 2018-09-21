import angular from 'angular';

const mdSticky = ($compile, $mdSticky) => {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    transclude: true,
    compile: (el, attrs, transclude) => (scope, element) => {
      element.addClass('md-sticky-content');
      const stickyClone = element.clone();
      stickyClone.removeAttr('md-sticky');

      transclude(scope, clone => {
        element.append(clone);
      });

      transclude(scope, clone => {
        // add stickyClone to dom before compiling so any
        // required controllers are found, otherwise we get a compile error
        // hide stickyClone before we add to dom
        stickyClone.css('visibility', 'hidden');
        element.after(stickyClone);
        $compile(stickyClone)(scope);
        stickyClone.remove();
        // remove style attr
        stickyClone.css('visibility', '');

        stickyClone.append(clone);
        $mdSticky(scope, element, stickyClone);
      });
    },
  };
};

export default angular
  .module('fims.mdSticky', [])
  .directive('mdSticky', mdSticky).name;

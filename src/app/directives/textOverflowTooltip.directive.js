import angular from 'angular';

/**
 * Used on the md-tooltip element to only display the tooltip if the parent element
 * text has been truncated
 */
const overflowTooltip = () => ({
  restrict: 'A',
  bindToController: true,
  link(scope, element) {
    const el = element[0];
    const parent = el.parentNode;
    if (el.tagName !== 'MD-TOOLTIP') {
      console.error(
        'textOverflowTooltip can only be used as an attribute on an md-tooltip element',
      );
    } else {
      element.parent().on('focus touchstart mouseenter', event => {
        event.stopImmediatePropagation();
        if (parent.offsetWidth < parent.scrollWidth) {
          scope.$$childHead.mdVisible = true;
          scope.$apply();
        }
      });
      element.parent().on('blur touchcancel mouseleave', event => {
        event.stopImmediatePropagation();
        if (parent.offsetWidth < parent.scrollWidth) {
          scope.$$childHead.mdVisible = false;
          scope.$apply();
        }
      });
    }
  },
});

export default angular
  .module('utils.textOverflowTooltip', [])
  .directive('textOverflowTooltip', overflowTooltip).name;

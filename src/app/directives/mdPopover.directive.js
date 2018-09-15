import angular from 'angular';
import '../../style/fims/_mdPopover.scss';

/**
 *
 * @param {mdZIndex} number md-z-index The visual level that the tooltip will appear
 *     in comparison with the rest of the elements of the application.
 * @param {mdPopoverClass} string md-popover-class String of classes to place on the popover
 * @param {mdPopoverGroup} string md-popover-group Name of group to place the popover in. Only 1 popover in this group will be opened at a time.
 * @param {mdDirection} string md-direction where to position the popover. One of 'top', 'bottom', 'left', 'right'
 */
const mdPopover = /* ngInject */ ($timeout, $mdPanel) => {
  const getPosition = (mdDirection, el) => {
    const w = el.width();
    const h = el.height();
    const position = $mdPanel.newPanelPosition().absolute();

    switch (mdDirection) {
      case 'top':
        return position.left(w ? `-${w / 2}px` : 0);
      case 'left':
        return position.top(h ? `-${h / 2}px` : 0).left(w ? `-${w}px` : 0);
      case 'right':
        return position.top(h ? `-${h / 2}px` : 0).left('100%');
      case 'bottom':
      default:
        return position.top('100%').left(w ? `-${w / 2}px` : 0);
    }
  };

  // const addArrow = (mdDirection, panelRef) => {
  // const template = '<div class="arrow"></div>';
  // const { panelContainer } = panelRef;
  // panelContainer.removeClass(['top', 'left', 'right', 'bottom']);

  // switch (mdDirection) {
  //   case 'top':
  //     return;
  //   case 'left':
  //     return;
  //   case 'right':
  //     return;
  //   case 'bottom':
  //   default:
  //     panelContainer.addClass('bottom');
  //     panelContainer.prepend(template);
  // }
  // };

  return {
    restrict: 'E',
    priority: 210,
    transclude: true,
    scope: {
      mdZIndex: '=?mdZIndex',
      mdPopoverClass: '@?mdPopoverClass', // Do not expect expressions.
      mdPopoverGroup: '@?mdPopoverGroup', // Do not expect expressions.
      mdDirection: '@?mdDirection', // Do not expect expressions.
    },
    link(scope, el, attr, controller, transclude) {
      const parent = el.parent();
      el.detach();

      const position = getPosition(scope.mdDirection, parent);

      const panelAnimation = $mdPanel
        .newPanelAnimation()
        .openFrom(parent)
        .closeTo(parent)
        .withAnimation($mdPanel.animation.SCALE);

      transclude(clone => {
        el.append(clone);
      });

      const config = {
        attachTo: parent,
        contentElement: el,
        panelClass: `md-popover md-popover-hide md-whiteframe-5dp 
                    layout-padding ${scope.mdPopoverClass || ''}`,
        animation: panelAnimation,
        position,
        openFrom: parent,
        groupName: scope.mdPopoverGroup,
        zIndex: scope.mdZIndex || 80,
        escapeToClose: true,
        focusOnOpen: true,
      };

      // const wrapper = angular.element(
      // '<div class="md-panel-outer-wrapper"></div>',
      // );

      // wrapper.on('click', () => parent.click());

      if (scope.mdPopoverGroup) {
        if (!$mdPanel._groups[scope.mdPopoverGroup]) {
          $mdPanel.newPanelGroup(scope.mdPopoverGroup, { maxOpen: 1 });
        }
      }

      const panelRef = $mdPanel.create(config);

      parent.on('click', () => {
        if (panelRef.isAttached) {
          // wrapper.detach();
          panelRef.close();
          panelRef.panelEl.addClass('md-popover-hide');
        } else {
          panelRef.open().then(() => {
            // we have to update the position after the panel is opened b/c we can't
            // get the width before hand
            panelRef.updatePosition(getPosition(scope.mdDirection, el));

            // todo if we enable this, scrolling breaks
            // wrapper.appendTo(document.body);

            // addArrow(scope.mdDirection, panelRef);

            // show panel after we recalculate the position
            $timeout(() => panelRef.panelEl.removeClass('md-popover-hide'));
          });
        }
      });

      scope.$on('$destroy', () => panelRef && panelRef.destroy());
    },
  };
};

export default angular
  .module('fims.mdPopover', [])
  .directive('mdPopover', mdPopover).name;

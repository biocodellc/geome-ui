import angular from 'angular';

/**
 * extend angular-material mdAutocomplete directive
 */
const mdAutocomplete = /* ngInject */ ($timeout, $mdUtil) => {
  'ngInject';

  return {
    restrict: 'E',
    require: 'mdAutocomplete',
    link: (scope, element, attrs, ctrl) => {
      const mdShowArrow =
        scope.$eval(attrs.mdShowArrow) || attrs.mdShowArrow === '';
      const mdClearOnBlur =
        scope.$eval(attrs.mdClearOnBlur) || attrs.mdClearOnBlur === '';

      if (mdShowArrow) {
        $timeout(() => {
          const input = element.find('input');
          const e = angular.element(
            '<span class="md-select-icon" aria-hidden="true"></span>',
          );
          input.after(e);

          input.on('focus', () => {
            e.css('cursor', 'default');
          });
          input.on('blur', () => {
            e.css('cursor', 'pointer');
          });
          e.on('click', () => {
            input.focus();
          });
        });
      }

      const origKeydown = ctrl.keydown;
      ctrl.keydown = (event, ...args) => {
        // default behavior in md-stepper when "enter" key was pressed was not working correctly
        // here we fix that behavior and also add the ability to select
        // return key
        if (event.keyCode === 13) {
          // select item if highlighted in dropdown
          if (
            ctrl.scope.selectedItem ||
            (!ctrl.hidden &&
              !ctrl.loading &&
              ctrl.index >= 0 &&
              ctrl.matches.length > 0)
          ) {
            // fixes bugs where selecting w/ mouse then pressing enter clears input
            const match = ctrl.scope.selectedItem || ctrl.matches[ctrl.index];
            $mdUtil.nextTick(() => {
              ctrl.select(ctrl.matches.findIndex(m => m === match));
            });
          }
          element.find('input').blur();
          event.preventDefault();
          return;
          // tab key
        } else if (event.keyCode === 9) {
          // if list isn't open, allow tab to behave normally
          if (ctrl.hidden) return;
          if (ctrl.loading) {
            event.preventDefault();
            return;
          }
          // 38 up arrow
          // 40 down arrow
          event.keyCode = event.shiftKey ? 38 : 40; // act like up/down arrow
        }
        origKeydown(event, ...args);
      };

      const origBlur = ctrl.blur;
      ctrl.blur = (...args) => {
        if (!ctrl.scope.requireMatch && attrs.mdOnAddNewItem) {
          // if md-on-add-new-item cb is present, evaluate the expression and add the return value as the selectedItem
          if (ctrl.scope.searchText && !ctrl.scope.selectedItem) {
            const newItem = scope.$eval(attrs.mdOnAddNewItem, {
              item: ctrl.scope.searchText,
            });

            if (newItem) {
              $mdUtil.nextTick(() => {
                ctrl.matches.push(newItem);
                ctrl.select(ctrl.matches.length - 1);
              });
            }
          }
        }

        if (mdClearOnBlur && !ctrl.scope.selectedItem) {
          ctrl.scope.searchText = '';
        }

        origBlur(...args);
      };
    },
  };
};

export default angular
  .module('fims.mdAutocomplete', [])
  .directive('mdAutocomplete', mdAutocomplete).name;

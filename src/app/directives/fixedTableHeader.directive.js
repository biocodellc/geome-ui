/* eslint-disable */
import angular from 'angular';

/**
 * slightly modified version of https://github.com/daniel-nagy/fixed-table-header/blob/master/src/fixed-table-header.js
 */

const fixHead = /* ngInject */ ($compile, $window, $timeout) => ({
  restrict: 'A',
  link: (scope, element) => {
    var table = {
      clone: element
        .parent()
        .clone()
        .empty(),
      original: element.parent(),
    };

    var header = {
      clone: element.clone(),
      original: element,
    };

    // prevent recursive compilation
    header.clone.removeAttr('fix-head').removeAttr('ng-if');

    table.clone
      .css({ display: 'block', overflow: 'hidden', 'margin-bottom': '0' })
      .addClass('clone');
    header.clone.css('display', 'block');
    header.original.css('visibility', 'hidden');

    var scrollContainer = table.original.parent();

    // insert the element so when it is compiled it will link
    // with the correct scope and controllers
    header.original.after(header.clone);

    $compile(table.clone)(scope);
    $compile(header.clone)(scope);

    scrollContainer
      .parent()[0]
      .insertBefore(table.clone.append(header.clone)[0], scrollContainer[0]);

    scrollContainer.on('scroll', function() {
      // use CSS transforms to move the cloned header when the table is scrolled horizontally
      header.clone.css(
        'transform',
        'translate3d(' + -scrollContainer.prop('scrollLeft') + 'px, 0, 0)',
      );
    });

    function cells() {
      return header.clone.find('th').length;
    }

    function getCells(node) {
      return Array.prototype.map.call(node.find('th'), function(cell) {
        return jQLite(cell);
      });
    }

    function height() {
      return header.original.prop('clientHeight');
    }

    function jQLite(node) {
      return angular.element(node);
    }

    function marginTop(height) {
      table.original.css('marginTop', '-' + height + 'px');
    }

    let hasSetWidth = false;

    function updateCells() {
      var cells = {
        clone: getCells(header.clone),
        original: getCells(header.original),
      };

      cells.clone.forEach(function(clone, index) {
        if (clone.data('isClone')) {
          return;
        }

        // prevent duplicating watch listeners
        clone.data('isClone', true);

        var cell = cells.original[index];
        var style = $window.getComputedStyle(cell[0]);

        var getWidth = function() {
          return style.width;
        };

        var setWidth = function() {
          marginTop(height());
          clone.css({ minWidth: style.width, maxWidth: style.width });
        };

        var listener = scope.$watch(getWidth, setWidth);

        $window.addEventListener('resize', setWidth);

        // hack to set correct width when used as child of ng-cloak
        if (!hasSetWidth) {
          $timeout(() => {
            hasSetWidth = true;
            setWidth();
          }, 100);
        }

        clone.on('$destroy', function() {
          listener();
          $window.removeEventListener('resize', setWidth);
        });

        cell.on('$destroy', function() {
          clone.remove();
        });
      });
    }

    scope.$watch(cells, updateCells);

    header.original.on('$destroy', function() {
      header.clone.remove();
    });
  },
});

export default angular
  .module('fims.fixedTableHeader', [])
  .directive('fixHead', fixHead).name;

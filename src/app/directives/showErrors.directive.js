import angular from 'angular';

function showErrors($timeout, showErrorsConfig, $interpolate) {
  'ngInject';

  var getShowSuccess, getTrigger, checkGroupValidity, linkFn;
  getTrigger = function (options) {
    var trigger;
    trigger = showErrorsConfig.trigger;
    if (options && (options.trigger != null)) {
      trigger = options.trigger;
    }
    return trigger;
  };
  getShowSuccess = function (options) {
    var showSuccess;
    showSuccess = showErrorsConfig.showSuccess;
    if (options && (options.showSuccess != null)) {
      showSuccess = options.showSuccess;
    }
    return showSuccess;
  };
  checkGroupValidity = function (inputNames, formCtrl) {
    var valid = true;
    // if 1 input in the group is invalid, then mark the group ad $invalid
    angular.forEach(inputNames, function (inputName) {

      if (formCtrl[inputName] && formCtrl[inputName].$invalid) {
        valid = false;
      }

    });
    return valid;
  };

  linkFn = function (scope, el, attrs, formCtrl) {
    var blurred, inputEl, inputNgEl, options, showSuccess, toggleClasses, trigger;
    var inputNames = [];
    blurred = false;
    options = scope.$eval(attrs.showErrors);
    showSuccess = getShowSuccess(options);
    trigger = getTrigger(options);
    // modified by RJ Ewing to allow multiple inputs under the same show-errors directive
    inputEls = el[0].querySelectorAll('.form-control[name], input[type=checkbox]');
    angular.forEach(inputEls, function (el) {
      inputEl = el;

      inputNgEl = angular.element(inputEl);
      var inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (inputName) {
        inputNames.push(inputName);
        inputNgEl.bind(trigger, function () {
          blurred = true;
          return toggleClasses(checkGroupValidity(inputNames, formCtrl));
        });
      }
    });

    if (inputNames.length === 0) {
      throw "show-errors element has no child input elements with a 'name' attribute and a 'form-control' class";
    }

    scope.$watch(function () {
      return checkGroupValidity(inputNames, formCtrl);
    }, function (valid) {
      if (!blurred) {
        return;
      }
      return toggleClasses(valid);
    });
    scope.$on('show-errors-check-validity', function () {
      return toggleClasses(checkGroupValidity(inputNames, formCtrl));
    });
    scope.$on('show-errors-reset', function () {
      return $timeout(function () {
        el.removeClass('has-error');
        el.removeClass('has-success');
        return blurred = false;
      }, 0, false);
    });
    return toggleClasses = function (valid) {
      el.toggleClass('has-error', !valid);
      if (showSuccess) {
        return el.toggleClass('has-success', valid);
      }
    };
  };

  return {
    restrict: 'A',
    require: '^form',
    compile: function (elem, attrs) {
      if (attrs['showErrors'].indexOf('skipFormGroupCheck') === -1) {
        if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
          throw "show-errors element does not have the 'form-group' or 'input-group' class";
        }
      }
      return linkFn;
    }
  };
}

function showErrorsConfig() {
  var _showSuccess, _trigger;
  _showSuccess = false;
  _trigger = 'blur';

  this.showSuccess = function (showSuccess) {
    console.log('in showSuccess provider function');
    return _showSuccess = showSuccess;
  };
  this.trigger = function (trigger) {
    console.log('in trigger provider function');
    return _trigger = trigger;
  };

  this.$get = function () {
    return {
      showSuccess: _showSuccess,
      trigger: _trigger
    };
  };
}


export default angular.module('ui.bootstrap.showErrors', [])
  .directive('showErrors', showErrors)
  .provider('showErrorsConfig', showErrorsConfig)
  .name;

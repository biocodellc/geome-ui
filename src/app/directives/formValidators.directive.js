import angular from 'angular';

/**
 * custom form validator to compare model to another value
 */
const compareTo = () => ({
  restrict: 'A',
  require: 'ngModel',
  scope: {
    compareTo: '=compareTo',
  },
  link(scope, elm, attr, ctrl) {
    ctrl.$validators.compareTo = modelValue => modelValue === scope.compareTo;

    scope.$watch('compareTo', () => {
      ctrl.$validate();
    });
  },
});

/**
 * form validator to compare model against an exclusion list
 */
const exclusionList = () => ({
  restrict: 'A',
  require: 'ngModel',
  scope: {
    exclusionList: '<',
    ignoreCase: '<',
  },
  link(scope, elm, attr, ctrl) {
    ctrl.$validators.exclusionList = modelValue =>
      scope.ignoreCase
        ? !scope.exclusionList.some(
            v => !modelValue || v.toLowerCase() === modelValue.toLowerCase(),
          )
        : !scope.exclusionList.some(v => v === modelValue);
  },
});

/**
 * custom form validator to check password strength
 */
const passwordStrength = /* ngInject */ $compile => ({
  restrict: 'A',
  require: 'ngModel',
  scope: {
    passwordStrength: '<',
    minPasswordStrength: '<',
    passwordStrengthIcons: '=',
  },
  link(scope, element, attrs, ctrl) {
    const ngModelOptions = scope.$eval(attrs.ngModelOptions);
    if (!ngModelOptions || ngModelOptions.allowInvalid === undefined) {
      ctrl.$options.$$options.allowInvalid = true;
    }

    const showIcons =
      scope.$eval(scope.passwordStrengthIcons) ||
      attrs.passwordStrengthIcons === '';

    const validElement = $compile(
      angular.element(
        '<md-icon md-font-icon="fa fa-check fa-xs" class="strong-password"></md-icon>',
      ),
    )(scope);

    const invalidElement = $compile(
      angular.element(
        '<md-icon md-font-icon="fa fa-close fa-xs" class="weak-password"></md-icon>',
      ),
    )(scope);

    const wrapper = angular.element('<div class="password-wrapper"></div>');
    element.wrap(wrapper);

    const re = /\W|\d/;
    const re2 = /[a-zA-Z]/;

    const checkValidity = modelValue => {
      if (ctrl.$isEmpty(modelValue)) {
        if (ctrl.$touched && showIcons) {
          invalidElement.remove();
        }
        return true;
      }

      if (
        modelValue.length > 15 ||
        (re.test(modelValue) && re2.test(modelValue) && modelValue.length >= 8)
      ) {
        if (ctrl.$touched && showIcons) {
          invalidElement.remove();
          element.after(validElement);
        }
        return true;
      }

      if (ctrl.$touched && showIcons) {
        validElement.remove();
        element.after(invalidElement);
      }
      return false;
    };

    ctrl.$validators.passwordStrength = checkValidity;

    element.on('blur', () => {
      if (!ctrl.$touched && showIcons) {
        const modelValue = element.val();
        if (
          modelValue.length > 15 ||
          (re.test(modelValue) &&
            re2.test(modelValue) &&
            modelValue.length >= 8)
        ) {
          invalidElement.remove();
          element.after(validElement);
        } else {
          validElement.remove();
          element.after(invalidElement);
        }
      }
    });
  },
});

/**
 * Custom form validator for username
 */
const username = /* ngInject */ UserService => ({
  restrict: 'A',
  require: 'ngModel',
  link: (scope, element, attrs, ctrl) => {
    ctrl.$asyncValidators.username = modelValue => {
      if (ctrl.$isEmpty(modelValue)) return Promise.resolve();

      return UserService.get(modelValue).then(user => {
        // user exists
        // rejected promises are invalid
        if (user) throw new Error();
      });
    };
  },
});

/**
 * Custom form validator for projectTitle
 */
const projectTitle = /* ngInject */ ProjectService => ({
  restrict: 'A',
  require: 'ngModel',
  link: (scope, element, attrs, ctrl) => {
    ctrl.$asyncValidators.projectTitle = modelValue => {
      if (ctrl.$isEmpty(modelValue)) return Promise.resolve();

      return ProjectService.checkExists(modelValue).then(({ data }) => {
        // rejected promises are invalid
        if (data) throw new Error();
      });
    };
  },
});

/**
 * Custom form validator for expeditionCode
 */
const expeditionCode = /* ngInject */ ExpeditionService => ({
  restrict: 'A',
  require: 'ngModel',
  link: (scope, element, attrs, ctrl) => {
    if (!attrs.projectId) {
      throw new Error(
        'project-id is a required attribute to use the expedition-code directive',
      );
    }

    ctrl.$asyncValidators.validExpeditionCode = modelValue => {
      if (ctrl.$isEmpty(modelValue)) return Promise.resolve();

      const projectId = scope.$eval(attrs.projectId);
      if (!projectId) {
        throw new Error('missing projectId');
      }

      return ExpeditionService.getExpedition(projectId, modelValue).then(
        ({ data }) => {
          // rejected promises are invalid
          if (data) throw new Error();
        },
      );
    };
  },
});

export default angular
  .module('fims.formValidators', [])
  .directive('compareTo', compareTo)
  .directive('exclusionList', exclusionList)
  .directive('passwordStrength', passwordStrength)
  .directive('username', username)
  .directive('validExpeditionCode', expeditionCode)
  .directive('projectTitle', projectTitle).name;

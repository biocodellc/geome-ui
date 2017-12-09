angular.module('fims.validation')

    .directive('fimsData', [function () {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                change: "&",
                isRequired: "="
            },
            link: function (scope, el, attrs, ngModelCtrl) {
                scope.inValid = false;

                scope.modelValueChange = modelValueChange;

                function modelValueChange($files) {
                    ngModelCtrl.$setViewValue($files[0]);

                    if (!$files[0]) {
                        scope.invalid = true;
                    } else {
                        scope.invalid = false;
                        scope.change();
                    }

                }

                ngModelCtrl.$render = function () {
                    scope.fimsMetadata = ngModelCtrl.$modelValue;
                };
            },
            templateUrl: 'app/components/validation/templates/fimsData.tpl.html'
        }

    }]);
/**
 * angular-spinner version 0.8.1
 * License: MIT.
 * Copyright (C) 2013, 2014, 2015, 2016, Uri Shaked and contributors.
 */

import angular from 'angular';
import Spinner from 'spin.js';

export default angular
  .module('angularSpinner', [])

  .constant('SpinJSSpinner', Spinner)

  .provider('usSpinnerConfig', () => {
    let _config = {},
      _themes = {};

    return {
      setDefaults(config) {
        _config = config || _config;
      },
      setTheme(name, config) {
        _themes[name] = config;
      },
      $get() {
        return {
          config: _config,
          themes: _themes,
        };
      },
    };
  })

  .factory('usSpinnerService', [
    '$rootScope',
    function($rootScope) {
      const config = {};

      config.spin = function(key) {
        $rootScope.$broadcast('us-spinner:spin', key);
      };

      config.stop = function(key) {
        $rootScope.$broadcast('us-spinner:stop', key);
      };

      return config;
    },
  ])

  .directive('usSpinner', [
    'SpinJSSpinner',
    'usSpinnerConfig',
    function(SpinJSSpinner, usSpinnerConfig) {
      return {
        scope: true,
        link(scope, element, attr) {
          scope.spinner = null;

          scope.key = angular.isDefined(attr.spinnerKey)
            ? attr.spinnerKey
            : false;

          scope.startActive = angular.isDefined(attr.spinnerStartActive)
            ? scope.$eval(attr.spinnerStartActive)
            : !scope.key;

          function stopSpinner() {
            if (scope.spinner) {
              scope.spinner.stop();
            }
          }

          scope.spin = function() {
            if (scope.spinner) {
              scope.spinner.spin(element[0]);
            }
          };

          scope.stop = function() {
            scope.startActive = false;
            stopSpinner();
          };

          scope.$watch(
            attr.usSpinner,
            options => {
              stopSpinner();

              // order of precedence: element options, theme, defaults.
              options = angular.extend(
                {},
                usSpinnerConfig.config,
                usSpinnerConfig.themes[attr.spinnerTheme],
                options,
              );

              scope.spinner = new SpinJSSpinner(options);
              if ((!scope.key || scope.startActive) && !attr.spinnerOn) {
                scope.spinner.spin(element[0]);
              }
            },
            true,
          );

          if (attr.spinnerOn) {
            scope.$watch(attr.spinnerOn, spin => {
              if (spin) {
                scope.spin();
              } else {
                scope.stop();
              }
            });
          }

          scope.$on('us-spinner:spin', (event, key) => {
            if (key === scope.key) {
              scope.spin();
            }
          });

          scope.$on('us-spinner:stop', (event, key) => {
            if (key === scope.key) {
              scope.stop();
            }
          });

          scope.$on('$destroy', () => {
            scope.stop();
            scope.spinner = null;
          });
        },
      };
    },
  ]).name;

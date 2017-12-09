import { AVAILABLE_RULES } from "./Rule";

(function () {
    'use strict';

    angular.module('fims.projects')
        .controller('AddRuleController', AddRuleController);

    AddRuleController.$inject = ['$state', 'alerts', 'config', 'entity'];

    function AddRuleController($state, alerts, config, entity) {
        var vm = this;

        vm.availableRules = AVAILABLE_RULES;
        vm.rule = undefined;
        vm.levels = config.ruleLevels();
        vm.add = add;

        init();

        function init() {
            vm.lists = [];
            angular.forEach(config.lists, function (list) {
                vm.lists.push(list.alias);
            });

            vm.columns = [];
            angular.forEach(entity.attributes, function (attribute) {
                vm.columns.push(attribute.column);
            });
        }

        function add() {
            var invalidMetadata = [];

            angular.forEach(vm.rule.metadata(), function(value, key) {
                if (!value || (angular.isArray(value) && value.length === 0)) {
                    invalidMetadata.push(key);
                }
            });

            if (invalidMetadata.length !== 0) {
                var msg;
                if (invalidMetadata.length > 1) {
                    msg = ' are all required';
                } else {
                    msg = ' is required';
                }

                alerts.error(invalidMetadata.join(', ') + msg);
                return;
            }
            
            if (entity.rules.indexOf(vm.rule) !== -1) {
                alerts.error('That rule already exists.');
            }

            alerts.removeTmp();
            entity.rules.push(vm.rule);
            $state.go('^');
        }
    }

})();

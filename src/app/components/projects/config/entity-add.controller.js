import Rule from "./Rule";

(function () {
    'use strict';

    angular.module('fims.projects')
        .controller('AddEntityController', AddEntityController);

    AddEntityController.$inject = ['$state', 'config'];

    function AddEntityController($state, config) {
        var vm = this;

        vm.isChild = false;
        vm.conceptAlias = undefined;
        vm.conceptURI = undefined;
        vm.parentEntity = undefined;
        vm.entities = undefined;
        vm.add = add;

        init();

        function init() {
            vm.entities = [];

            angular.forEach(config.entities, function(entity) {
                vm.entities.push(entity.conceptAlias);
            });
        }

        function add() {
            for (var i = 0; i < config.entities.length; i++) {
                if (config.entities[i].conceptAlias.toLowerCase() === vm.conceptAlias.toLowerCase()) {
                    vm.addForm.conceptAlias.$setValidity("unique", false);
                    return;
                }
            }

            var entity = {
                attributes: [],
                rules: [],
                conceptAlias: vm.conceptAlias.toLowerCase(),
                parentEntity: vm.parentEntity,
                conceptURI: vm.conceptURI,
                editable: true,
                isNew: true
            };

            if (vm.parentEntity) {
                var rule = Rule.newRule("RequiredValue");
                rule.level = 'ERROR';
                var column = config.entityUniqueKey(vm.parentEntity);
                rule.columns.push(column);

                entity.attributes.push({
                    column: column,
                    datatype: 'STRING',
                    group: 'Default',
                });

                entity.rules.push(rule);
            }

            config.entities.push(entity);

            $state.go('^.detail.attributes', { alias: entity.conceptAlias, entity: entity, addAttribute: true });
        }
    }

})();

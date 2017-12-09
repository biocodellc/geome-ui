(function () {
    'use strict';

    angular.module('fims.projects')
        .controller('AddListController', AddListController);

    AddListController.$inject = ['$state', 'config'];

    function AddListController($state, config) {
        var vm = this;

        vm.caseSensitive = false;
        vm.alias = undefined;
        vm.add = add;

        function add() {
            for (var i = 0; i < config.lists.length; i++) {
                if (config.lists[i].alias === vm.alias) {
                    vm.addForm.alias.$setValidity("unique", false);
                    return;
                }
            }

            config.lists.push({
                fields: [],
                alias: vm.alias,
                caseInsensitive: !vm.caseSensitive,
            });

            $state.go('^.detail', {alias: vm.alias, addField: true});
        }
    }

})();

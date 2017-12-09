(function () {
    'use strict';

    angular.module('fims.projects')
        .controller('ConfigController', ConfigController);

    ConfigController.$inject = ['$scope', '$state', 'project', 'ProjectConfigService', 'alerts', 'config'];

    function ConfigController($scope, $state, project, ProjectConfigService, alerts, config) {
        var vm = this;

        vm.add = add;
        vm.save = save;
        vm.addText = undefined;
        vm.config = config;

        function add() {
            $scope.$broadcast('$configAddEvent');
        }

        function save() {
            alerts.removeTmp();
            ProjectConfigService.save(vm.config, project.projectId)
                .then(function(config) {
                    project.config = config;
                    alerts.success("Successfully updated project configuration!");
                }, function (response) {
                    if (response.status === 400) {
                        angular.forEach(response.data.errors, function(error) {
                            alerts.error(error);
                        });
                    }
                });
        }

        $scope.$watch(function () {
            return $state.current.name;
        }, function (name) {
            if (name === 'project.config.entities') {
                vm.addText = 'Entity';
            } else if (name === 'project.config.lists') {
                vm.addText = 'List';
            }
        });

        $scope.$watch('vm.config'
        , function (newVal, oldVal) {
            if (!vm.config.modified && !angular.equals(newVal, oldVal)) {
                vm.config.modified = true;
            }
        }, true);
    }
})();

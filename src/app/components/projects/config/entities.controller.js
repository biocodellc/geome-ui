(function () {
    'use strict';

    angular.module('fims.projects')
        .controller('EntitiesController', EntitiesController);

    EntitiesController.$inject = ['$scope', '$state', 'config'];

    function EntitiesController($scope, $state, config) {
        var vm = this;
        vm.config = config;

        /**
         * catch child emit event and rebroadcast to all children. This is the only way to broadcast to sibling elements
         */
        $scope.$on("$closeSiblingEditPopupEvent", function(event) {
            event.stopPropagation();
            $scope.$broadcast("$closeEditPopupEvent");
        });

        $scope.$on('$configAddEvent', function () {
            $state.go('.add');
        })
    }
})();

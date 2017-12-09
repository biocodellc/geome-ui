(function () {
    'use strict';

    angular.module('fims.projects')
        .controller('ConfigMetadataController', ConfigMetadataController);

    ConfigMetadataController.$inject = ['project'];

    function ConfigMetadataController(project) {
        var vm = this;

        vm.config = project.config;
    }
})();

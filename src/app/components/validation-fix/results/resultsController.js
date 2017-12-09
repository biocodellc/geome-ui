angular.module('fims.validation')

    .controller('ResultsCtrl', ['ResultsDataFactory', function (ResultsDataFactory) {
        var vm = this;
        vm.results = ResultsDataFactory;
        vm.isEmptyObject = isEmptyObject;

        function isEmptyObject(obj) {
            return angular.equals({}, obj);
        }
    }]);
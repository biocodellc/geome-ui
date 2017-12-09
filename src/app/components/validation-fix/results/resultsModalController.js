angular.module('fims.validation')
    .factory('ResultsDataFactory', [
        function () {
            var resultsDataFactory = {};
            var defaultState = {
                validationResponse: null,
                error: null,
                status: null,
                uploadMessage: null,
                processing: true,
                reset: reset
            };

            defaultState.reset();

            return resultsDataFactory;

            function reset() {
                angular.copy(defaultState, resultsDataFactory);
            }

        }])

    .controller('ResultsModalCtrl', ['$rootScope', '$uibModalInstance', 'ResultsDataFactory',
        function ($rootScope, $uibModalInstance, ResultsDataFactory) {
            var vm = this;
            vm.results = ResultsDataFactory;

            vm.close = close;
            vm.continueUpload = continueUpload;
            vm.cancel = cancel;

            function cancel() {
                $uibModalInstance.dismiss('cancel');
            }

            function close() {
                $uibModalInstance.close();
            }

            function continueUpload() {
                $rootScope.$broadcast('resultsModalContinueUploadEvent', {});
            }

        }]);

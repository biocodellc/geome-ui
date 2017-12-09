angular.module('fims.lookup')


.controller('LookupMetadataCtrl', ['$state', '$scope', '$http', '$stateParams', 'LookupFactory', 'REST_ROOT',
    function ($state, $scope, $http, $stateParams, LookupFactory, REST_ROOT) {
        var DATASET_TYPE = "http://purl.org/dc/dcmitype/Dataset";

        var vm = this;
        vm.identifier = LookupFactory.identifier;
        vm.metadata = fetchMetadata();
        vm.filteredMetadata = filterMetadata;

        function filterMetadata() {
            var filteredMetadata = {};
            var metadataToExclude = ['identifier', 'datasets', 'download', 'message'];
            angular.forEach(vm.metadata, function(value, key) {
                if (metadataToExclude.indexOf(key) === -1 && value.value.trim()) {
                    filteredMetadata[key] = value;
                }
            });
            return filteredMetadata;
        }


        function fetchMetadata() {
            vm.identifier = $stateParams.ark;
            if (!angular.isUndefined(vm.identifier)) {
                LookupFactory.identifier = vm.identifier;
                var metadata = {};
                LookupFactory.fetchMetadata().then(
                    function(data, status, headers, config) {
                        angular.extend(metadata, data.data);
                        if (vm.metadata['rdf:type'].value == DATASET_TYPE) {
                            metadata.download = REST_ROOT + 'bcids/dataset/' + vm.identifier;
                        }
                    },
                    function (data, status, headers, config) {
                        if (status === 404) {
                            vm.error = "Invalid identifier";
                        } else {
                            vm.error = data.data.usrMessage;
                        }
                    });


                return metadata;
            } else {
                $state.go('lookup');
            }
        }

    }])
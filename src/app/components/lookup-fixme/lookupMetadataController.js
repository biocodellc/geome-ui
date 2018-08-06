import angular from 'angular';

import config from '../../utils/config';
const { restRoot } = config;

angular
  .module('fims.lookup')

  .controller('LookupMetadataCtrl', [
    '$state',
    '$scope',
    '$http',
    '$stateParams',
    'LookupFactory',
    function($state, $scope, $http, $stateParams, LookupFactory) {
      const DATASET_TYPE = 'http://purl.org/dc/dcmitype/Dataset';

      const vm = this;
      vm.identifier = LookupFactory.identifier;
      vm.metadata = fetchMetadata();
      vm.filteredMetadata = filterMetadata;

      function filterMetadata() {
        const filteredMetadata = {};
        const metadataToExclude = [
          'identifier',
          'datasets',
          'download',
          'message',
        ];
        angular.forEach(vm.metadata, (value, key) => {
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
          const metadata = {};
          LookupFactory.fetchMetadata().then(
            (data, status, headers, config) => {
              angular.extend(metadata, data.data);
              if (vm.metadata['rdf:type'].value == DATASET_TYPE) {
                metadata.download = `${restRoot}bcids/dataset/${vm.identifier}`;
              }
            },
            (data, status, headers, config) => {
              if (status === 404) {
                vm.error = 'Invalid identifier';
              } else {
                vm.error = data.data.usrMessage;
              }
            },
          );

          return metadata;
        }
        $state.go('lookup');
      }
    },
  ]);

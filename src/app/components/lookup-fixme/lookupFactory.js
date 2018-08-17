import angular from 'angular';

import config from '../../utils/config';

const { resolverRoot } = config;

angular
  .module('fims.lookup')

  .factory('LookupFactory', [
    '$http',
    function($http) {
      const identifier = 'ark:/21547/R2';

      const lookupFactory = {
        identifier,
        fetchMetadata,
        submitForm,
        updateFactory,
      };

      return lookupFactory;

      function fetchMetadata() {
        return $http.get(`${resolverRoot}metadata/${lookupFactory.identifier}`);
      }

      function submitForm() {
        return $http.get(resolverRoot + lookupFactory.identifier, {
          headers: { Accept: 'application/json' },
        });
      }

      function updateFactory(identifier) {
        lookupFactory.identifier = identifier;
      }
    },
  ]);

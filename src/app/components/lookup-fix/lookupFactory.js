angular
  .module('fims.lookup')

  .factory('LookupFactory', [
    '$http',
    'ID_REST_ROOT',
    function($http, ID_REST_ROOT) {
      const identifier = 'ark:/21547/R2';

      const lookupFactory = {
        identifier,
        fetchMetadata,
        submitForm,
        updateFactory,
      };

      return lookupFactory;

      function fetchMetadata() {
        return $http.get(`${ID_REST_ROOT}metadata/${lookupFactory.identifier}`);
      }

      function submitForm() {
        return $http.get(ID_REST_ROOT + lookupFactory.identifier, {
          headers: { Accept: 'application/json' },
        });
      }

      function updateFactory(identifier) {
        lookupFactory.identifier = identifier;
      }
    },
  ]);

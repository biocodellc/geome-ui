angular.module('fims.lookup')

.factory('LookupFactory', ['$http', 'ID_REST_ROOT', function ($http, ID_REST_ROOT) {
    var identifier = "ark:/21547/R2";

    var lookupFactory = {
        identifier: identifier,
        fetchMetadata: fetchMetadata,
        submitForm: submitForm,
        updateFactory: updateFactory
    };

    return lookupFactory;

    function fetchMetadata() {
        return $http.get(ID_REST_ROOT + 'metadata/' + lookupFactory.identifier);
    }
    
    function submitForm() {
        return $http.get(ID_REST_ROOT + lookupFactory.identifier, {
            headers: {'Accept': 'application/json'}
        });
    }
    
    function updateFactory(identifier) {
        lookupFactory.identifier = identifier;
    }

}]);

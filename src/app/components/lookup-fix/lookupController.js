angular.module('fims.lookup')

.controller('LookupCtrl', ['$scope', '$state', '$stateParams', '$window', 'LookupFactory',
    function ($scope, $state, $stateParams, $window, LookupFactory) {
        var vm = this;
        vm.identifier = LookupFactory.identifier;
        vm.submit = submitForm;
        vm.updateFactory = updateFactory;

        function updateFactory() {
            LookupFactory.updateFactory(vm.identifier);
        }
        
        (function () {
            /* parse input parameter -- ARKS must be minimum length of 12 characters*/
            var id = $stateParams.id;
            if (angular.isDefined(id) && id.length > 12) {
                LookupFactory.identifier = id;
                submitForm();
            }
        }).call(this);

        function submitForm() {
            vm.error = undefined;
            LookupFactory.submitForm().then(
                function(response) {
                    $window.location = response.data.url;
                },
                function(response) {
                    // hack until we fix jetty 404's
                    if (response.status == 404) {
                        $state.go('lookup.metadata', {'ark': LookupFactory.identifier});
                    } else {
                        vm.error = response.data.usrMessage;
                        if (!vm.error)
                            vm.error = "Server Error!";
                    }
                }
            );
        }

        $scope.$watch(
            function(){ return LookupFactory.identifier},

            function(newVal) {
                vm.identifier = newVal;
            }
        )
    }])
            

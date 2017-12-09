(function () {
    'use strict';

    angular.module('fims.projects')
        .controller('EntityAttributesController', EntityAttributesController);

    EntityAttributesController.$inject = ['$state', '$scope', 'entity'];

    function EntityAttributesController($state, $scope, entity) {
        var vm = this;
        vm.attributes = entity.attributes;
        vm.dndDrop = dndDropCallback;
        vm.dndStart = dndStartCallback;
        vm.deleteAttr = deleteAttr;
        
        init();

        function init() {
            if ($state.params.addAttribute) {
                _newAttribute();
            }
        }

        function dndDropCallback(index, item) {
            var i, l,
                currentIndex = 0;

            for (i = 0, l = vm.attributes.length; i < l; i++) {
                if (angular.equals(vm.attributes[i], item)) {
                    currentIndex = i;
                    break;
                }
            }

            // drag to the same place
            if (index === currentIndex || index === (currentIndex + 1)) {
                return false;
            }

            // remove the item from the current position
            vm.attributes.splice(currentIndex, 1);

            // 'fix' the new position index if it was shifted after the removing
            if (currentIndex < index) {
                index--;
            }

            // insert the item into the new position
            vm.attributes.splice(index, 0, item);
            return true;
        }

        function dndStartCallback() {
            $scope.$broadcast("$closeEditPopupEvent");
        }

        function deleteAttr(i) {
            vm.attributes.splice(i, 1);
        }

        /**
         * catch child emit event and rebroadcast to all children. This is the only way to broadcast to sibling elements
         */
        $scope.$on("$closeSiblingEditPopupEvent", function(event) {
            event.stopPropagation();
            $scope.$broadcast("$closeEditPopupEvent");
        });

        $scope.$on('$entityAddEvent', function () {
            _newAttribute();
        });

        function _newAttribute() {
            vm.attributes.push({
                datatype: 'STRING',
                group: 'Default',
                isNew: true
            });
        }
    }
})();

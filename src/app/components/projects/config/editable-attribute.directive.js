(function () {
    'use strict';

    angular.module('fims.projects')
        // .directive('editAttribute', editAttribute)
        // .directive('editableAttribute', editableAttribute);

    // editAttribute.$inject = ['$location', '$anchorScroll', '$uibTooltip'];

    function editAttribute($location, $anchorScroll, $uibTooltip) {
        return {
            restrict: 'A',
            scope: {
                attribute: '=',
                index: '=',
                onDelete: '&'
            },
            bindToController: true,
            controller: _attributeController,
            controllerAs: 'vm',
            templateUrl: 'app/components/projects/config/templates/attribute.tpl.html',
            compile: function (el, attrs) {
                var tooltipLink = $uibTooltip('editPopoverTemplate', 'editPopover', 'none', {
                    useContentExp: true
                }).compile.apply(this, arguments);

                return function link(scope, element, attrs, ctrl) {
                    tooltipLink.apply(this, arguments);

                    ctrl.delimited = (ctrl.attribute.delimiter);

                    if (ctrl.attribute.isNew) {
                        ctrl.editing = true;
                        $location.hash("attribute_" + ctrl.index);
                        $anchorScroll();
                        delete ctrl.attribute.isNew;
                    }
                }
            }
        }
    }

    editableAttribute.$inject = ['$compile'];

    function editableAttribute($compile) {
        return {
            priority: 1001,
            terminal: true, // don't compile anything else, they will be compiled in the link function
            compile: function (el, attrs) {
                el.removeAttr('editable-attribute');
                el.attr('edit-attribute', "");
                el.attr('edit-popover-template', "'app/components/projects/config/templates/edit-attribute.tpl.html'");
                el.attr('edit-popover-is-open', 'vm.editing');
                el.attr('edit-popover-placement', 'auto bottom');
                el.attr('edit-popover-class', 'edit-popover');

                return function link(scope, iElement, iAttrs, ctrl) {
                    $compile(iElement)(scope);
                }
            }
        }
    }

    _attributeController.$inject = ['$scope', '$uibModal'];

    function _attributeController($scope, $uibModal) {
        var vm = this;
        var _broadcaster = false;

        vm.datatypes = ['STRING', 'INTEGER', 'FLOAT', 'DATE', 'DATETIME', 'TIME'];
        vm.dataformatTypes = ['DATE', 'DATETIME', 'TIME'];
        vm.editing = false;
        vm.remove = remove;
        vm.toggleEdit = toggleEdit;

        function remove() {
            var modal = $uibModal.open({
                templateUrl: 'app/components/projects/config/templates/delete-attribute-confirmation.tpl.html',
                size: 'md',
                controller: _deleteConfirmationController,
                controllerAs: 'vm',
                windowClass: 'app-modal-window',
                backdrop: 'static'
            });

            modal.result.then(
                function () {
                    vm.onDelete({index: vm.index});
                }
            );
        }

        function toggleEdit() {
            if (!vm.editing) {
                _broadcaster = true; // close other popups when we open this one
                $scope.$emit("$closeSiblingEditPopupEvent");
            }

            vm.editing = !vm.editing;
        }

        $scope.$on("$closeEditPopupEvent", function () {
            if (!_broadcaster) {
                vm.editing = false;
            }
            _broadcaster = false;
        });

        $scope.$watch('vm.delimited', function(val) {
            if (!val) {
                vm.attribute.delimiter = undefined;
            }
        })
    }

    _deleteConfirmationController.$inject = ['$uibModalInstance'];

    function _deleteConfirmationController($uibModalInstance) {
        var vm = this;
        vm.delete = $uibModalInstance.close;
        vm.cancel = $uibModalInstance.dismiss;
    }
})();

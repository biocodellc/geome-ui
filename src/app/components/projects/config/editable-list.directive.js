(function () {
    'use strict';

    angular.module('fims.projects')
        .directive('editList', editList)
        .directive('editableList', editableList);

    editList.$inject = ['$uibTooltip'];

    function editList($uibTooltip) {
        return {
            restrict: 'A',
            scope: {
                list: '=',
                index: '=',
                config: '<'
            },
            bindToController: true,
            controller: _listController,
            controllerAs: 'vm',
            templateUrl: 'app/components/projects/config/templates/list.tpl.html',
            compile: function (el, attrs) {
                var tooltipLink = $uibTooltip('editPopoverTemplate', 'editPopover', 'none', {
                    useContentExp: true
                }).compile.apply(this, arguments);

                return function link(scope, element, attrs, ctrl) {
                    tooltipLink.apply(this, arguments);

                    ctrl.caseSensitive = !ctrl.list.caseInsensitive;
                }
            }
        }
    }

    editableList.$inject = ['$compile'];

    function editableList($compile) {
        return {
            priority: 1001,
            terminal: true, // don't compile anything else, they will be compiled in the link function
            compile: function (el, attrs) {
                el.removeAttr('editable-list');
                el.attr('edit-list', "");
                el.attr('edit-popover-template', "'app/components/projects/config/templates/edit-list.tpl.html'");
                el.attr('edit-popover-is-open', 'vm.editing');
                el.attr('edit-popover-placement', 'auto bottom');
                el.attr('edit-popover-class', 'edit-popover');

                return function link(scope, iElement, iAttrs, ctrl) {
                    $compile(iElement)(scope);
                }
            }
        }
    }

    _listController.$inject = ['$scope', '$uibModal'];

    function _listController($scope, $uibModal) {
        var vm = this;
        var _broadcaster = false;

        vm.editing = false;
        vm.remove = remove;
        vm.toggleEdit = toggleEdit;

        function remove() {
            var modal = $uibModal.open({
                templateUrl: 'app/components/projects/config/templates/delete-list-confirmation.tpl.html',
                size: 'md',
                controller: _deleteConfirmationController,
                controllerAs: 'vm',
                windowClass: 'app-modal-window',
                backdrop: 'static'
            });

            modal.result.then(
                function () {
                    var i = vm.config.lists.indexOf(vm.list);
                    vm.config.lists.splice(i, 1);
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

        function _checkDuplicates() {
            var lists = _existingLists();

            for (var i = 0; i < lists.length; i++) {
                if (lists.indexOf(vm.list.alias) > -1) {
                    return true;
                }
            }

            return false;
        }

        function _existingLists() {
            var lists = [];
            angular.forEach(vm.config.lists, function (list) {
                lists.push(list.alias);
            });

            lists.splice(lists.indexOf(vm.list.alias), 1); // remove this list.alias

            return lists;
        }

        $scope.$on("$closeEditPopupEvent", function () {
            if (!_broadcaster) {
                vm.editing = false;
            }
            _broadcaster = false;
        });

        $scope.$watch("vm.field.value", function() {
            vm.duplicateValue = _checkDuplicates();
        })
    }

    _deleteConfirmationController.$inject = ['$uibModalInstance'];

    function _deleteConfirmationController($uibModalInstance) {
        var vm = this;
        vm.delete = $uibModalInstance.close;
        vm.cancel = $uibModalInstance.dismiss;
    }
})
();

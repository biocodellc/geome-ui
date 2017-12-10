(function () {
    'use strict';

    angular.module('fims.projects')
        // .directive('editEntity', editEntity)
        // .directive('editableEntity', editableEntity);

    // editEntity.$inject = ['$location', '$anchorScroll', '$uibTooltip'];

    function editEntity($location, $anchorScroll, $uibTooltip) {
        return {
            restrict: 'A',
            scope: {
                entity: '=',
                index: '=',
                config: '='
            },
            bindToController: true,
            controller: _entityController,
            controllerAs: 'vm',
            templateUrl: 'app/components/projects/config/templates/entity.tpl.html',
            compile: function (el, attrs) {
                var tooltipLink = $uibTooltip('editPopoverTemplate', 'editPopover', 'none', {
                    useContentExp: true
                }).compile.apply(this, arguments);

                return function link(scope, element, attrs, ctrl) {
                    tooltipLink.apply(this, arguments);

                    if (ctrl.entity.isNew) {
                        ctrl.editing = true;
                        $location.hash("entity_" + ctrl.index);
                        $anchorScroll();
                        delete ctrl.entity.isNew;
                    }

                    ctrl.columns = [];
                    angular.forEach(ctrl.entity.attributes, function (attribute) {
                        ctrl.columns.push(attribute.column);
                    });

                    ctrl.existingWorksheets = ctrl.config.worksheets();

                }
            }
        }
    }

    editableEntity.$inject = ['$compile'];

    function editableEntity($compile) {
        return {
            priority: 1001,
            terminal: true, // don't compile anything else, they will be compiled in the link function
            compile: function (el, attrs) {
                el.removeAttr('editable-entity');
                el.attr('edit-entity', "");
                el.attr('edit-popover-template', "'app/components/projects/config/templates/edit-entity.tpl.html'");
                el.attr('edit-popover-is-open', 'vm.editing');
                el.attr('edit-popover-placement', 'auto bottom');
                el.attr('edit-popover-class', 'edit-popover');

                return function link(scope, iElement, iAttrs, ctrl) {
                    $compile(iElement)(scope);
                }
            }
        }
    }

    _entityController.$inject = ['$scope', '$uibModal'];

    function _entityController($scope, $uibModal) {
        var vm = this;
        var _broadcaster = false;

        vm.editing = false;
        vm.remove = remove;
        vm.toggleEdit = toggleEdit;
        vm.newWorksheet = newWorksheet;

        function remove() {
            var modal = $uibModal.open({
                templateUrl: 'app/components/projects/config/templates/delete-entity-confirmation.tpl.html',
                size: 'md',
                controller: _deleteConfirmationController,
                controllerAs: 'vm',
                windowClass: 'app-modal-window',
                backdrop: 'static'
            });

            modal.result.then(
                function () {
                    var i = vm.config.entities.indexOf(vm.entity);
                    vm.config.entities.splice(i, 1);
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

        function newWorksheet(worksheet) {
            vm.existingWorksheets.push(worksheet);
            return worksheet;
        }

        $scope.$on("$closeEditPopupEvent", function () {
            if (!_broadcaster) {
                vm.editing = false;
            }
            _broadcaster = false;
        });
        
        $scope.$watch('vm.entity.uniqueKey', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                var rule = vm.config.getRule(vm.entity.conceptAlias, 'RequiredValue', 'ERROR');

                if (rule.columns.indexOf(vm.entity.uniqueKey) === -1) {
                    rule.columns.push(vm.entity.uniqueKey);
                }
            }
        });
    }

    _deleteConfirmationController.$inject = ['$uibModalInstance'];

    function _deleteConfirmationController($uibModalInstance) {
        var vm = this;
        vm.delete = $uibModalInstance.close;
        vm.cancel = $uibModalInstance.dismiss;
    }
})
();

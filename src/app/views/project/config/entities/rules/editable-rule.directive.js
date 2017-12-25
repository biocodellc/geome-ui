editRule.$inject = [ '$uibTooltip' ];

export function editRule($uibTooltip) {
  return {
    restrict: 'A',
    scope: {
      rule: '=',
      entity: '<',
      index: '=',
      onDelete: '&',
      config: '<',
    },
    bindToController: true,
    controller: _ruleController,
    controllerAs: 'vm',
    template: require('./rule.html'),
    compile: function (el, attrs) {
      var tooltipLink = $uibTooltip('editPopoverTemplate', 'editPopover', 'none', {
        useContentExp: true,
      }).compile.apply(this, arguments);

      return function link(scope, element, attrs, ctrl) {
        tooltipLink.apply(this, arguments);

        ctrl.lists = [];
        angular.forEach(ctrl.config.lists, function (list) {
          ctrl.lists.push(list.alias);
        });

        ctrl.columns = [];
        angular.forEach(ctrl.entity.attributes, function (attribute) {
          ctrl.columns.push(attribute.column);
        });
      }
    },
  }
}

editableRule.$inject = [ '$compile' ];

export function editableRule($compile) {

  return {
    priority: 1001,
    terminal: true, // don't compile anything else, they will be compiled in the link function
    compile: function (el, attrs) {
      el.removeAttr('editable-rule');
      el.attr('edit-rule', "");
      el.attr('edit-popover-template', "'app/components/projects/config/templates/edit-rule.html'");
      el.attr('edit-popover-is-open', 'vm.editing');
      el.attr('edit-popover-placement', 'auto bottom');
      el.attr('edit-popover-class', 'edit-popover');

      return function link(scope, iElement, iAttrs, ctrl) {
        $compile(iElement)(scope);
      }
    },
  }
}

_ruleController.$inject = [ '$scope', '$uibModal' ];

function _ruleController($scope, $uibModal) {
  var vm = this;
  var _broadcaster = false;

  vm.editing = false;
  vm.isArray = angular.isArray;
  vm.remove = remove;
  vm.toggleEdit = toggleEdit;

  function remove() {
    var modal = $uibModal.open({
      template: require('./delete-rule-confirmation.html'),
      size: 'md',
      controller: _deleteConfirmationController,
      controllerAs: 'vm',
      windowClass: 'app-modal-window',
      backdrop: 'static',
    });

    modal.result.then(
      function () {
        vm.onDelete({ index: vm.index });
      },
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
}

_deleteConfirmationController.$inject = [ '$uibModalInstance' ];

function _deleteConfirmationController($uibModalInstance) {
  var vm = this;
  vm.delete = $uibModalInstance.close;
  vm.cancel = $uibModalInstance.dismiss;
}

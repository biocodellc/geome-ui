editField.$inject = [ '$uibTooltip', '$location', '$anchorScroll' ];

export function editField($uibTooltip, $location, $anchorScroll) {
  return {
    restrict: 'A',
    scope: {
      field: '=',
      list: '<',
      index: '=',
      onDelete: '&',
    },
    bindToController: true,
    controller: _fieldController,
    controllerAs: 'vm',
    template: require('./templates/field.html'),
    compile: function (el, attrs) {
      var tooltipLink = $uibTooltip('editPopoverTemplate', 'editPopover', 'none', {
        useContentExp: true,
      }).compile.apply(this, arguments);

      return function link(scope, element, attrs, ctrl) {
        tooltipLink.apply(this, arguments);

        if (ctrl.field.isNew) {
          ctrl.editing = true;
          $location.hash("field_" + ctrl.index);
          $anchorScroll();
          delete ctrl.field.isNew;
        }
      }
    },
  }
}

editableField.$inject = [ '$compile' ];

export function editableField($compile) {

  return {
    priority: 1001,
    terminal: true, // don't compile anything else, they will be compiled in the link function
    compile: function (el, attrs) {
      el.removeAttr('editable-field');
      el.attr('edit-field', "");
      el.attr('edit-popover-template', "'app/components/projects/config/templates/edit-field.html'");
      el.attr('edit-popover-is-open', 'vm.editing');
      el.attr('edit-popover-placement', 'auto bottom');
      el.attr('edit-popover-class', 'edit-popover');

      return function link(scope, iElement, iAttrs, ctrl) {
        $compile(iElement)(scope);
      }
    },
  }
}

_fieldController.$inject = [ '$scope', '$uibModal' ];

function _fieldController($scope, $uibModal) {
  var vm = this;
  var _broadcaster = false;

  vm.editing = false;
  vm.duplicateValue = false;
  vm.remove = remove;
  vm.toggleEdit = toggleEdit;

  function remove() {
    var modal = $uibModal.open({
      template: require('./templates/delete-field-confirmation.html'),
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

  function _checkDuplicates() {
    var fields = _existingFields();
    var val = (vm.list.caseInsensitive) ? vm.field.value.toLowerCase() : vm.field.value;

    for (var i = 0; i < fields.length; i++) {
      if (fields.indexOf(val) > -1) {
        return true;
      }
    }

    return false;
  }

  function _existingFields() {
    var fields = [];
    angular.forEach(vm.list.fields, function (field) {
      fields.push((vm.list.caseInsensitive) ? field.value.toLowerCase() : field.value);
    });

    fields.splice(fields.indexOf(vm.field.value), 1); // remove this field.value from the list

    return fields;
  }

  $scope.$on("$closeEditPopupEvent", function () {
    if (!_broadcaster) {
      vm.editing = false;
    }
    _broadcaster = false;
  });

  $scope.$watch("vm.field.value", function () {
    vm.duplicateValue = _checkDuplicates();
  })
}

_deleteConfirmationController.$inject = [ '$uibModalInstance' ];

function _deleteConfirmationController($uibModalInstance) {
  var vm = this;
  vm.delete = $uibModalInstance.close;
  vm.cancel = $uibModalInstance.dismiss;
}

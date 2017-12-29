class ListsController {
  constructor($uibModal, ConfirmationService) {
    'ngInject';

    this.$uibModal = $uibModal;
    this.ConfirmationService = ConfirmationService;
  }

  $onInit() {
    this.lists = this.lists.slice();
  }

  handleToggleEdit(index) {
    if (this.editList === index) {
      delete this.editList;
    } else {
      this.editList = index;
    }
  }

  handleRemoveList(alias) {
    this.ConfirmationService.confirm(
      `Are you sure you want to delete this list?`,
      () => {
        const i = this.lists.findIndex(l => l.alias === alias);
        this.lists.splice(i, 1);
        this.onUpdateLists({ lists: this.lists });
      });
  }

  handleUpdateList($index, list) {
    // TODO do we need to do any validation here?
    this.lists.splice($index, 1, list);
    this.onUpdateLists({ lists: this.lists });
  }
}

export default {
  template: require('./lists.html'),
  controller: ListsController,
  bindings: {
    lists: '<',
    onUpdateLists: '&',
  },
};

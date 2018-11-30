const template = require('./lists.html');
const addTemplate = require('./add-list.html');

class ListsController {
  constructor($state, $mdDialog) {
    'ngInject';

    this.$state = $state;
    this.$mdDialog = $mdDialog;
  }

  $onChanges($changesObj) {
    if ('lists' in $changesObj) {
      this.lists = this.lists.slice();
    }
  }

  removeList($event, list) {
    this.$mdDialog
      .show(
        this.$mdDialog
          .confirm()
          .textContent('Are you sure you want to delete this list?')
          .ok('Delete')
          .targetEvent($event)
          .cancel('Cancel'),
      )
      .then(() => {
        const i = this.lists.indexOf(list);
        this.lists.splice(i, 1);
        this.handleChange();
      })
      .catch(() => {});
  }

  addList($event) {
    this.$mdDialog
      .show({
        template: addTemplate,
        locals: {
          list: { caseInsensitive: false, networkList: false, fields: [] },
          existingAliases: this.lists.map(l => l.alias),
          $mdDialog: this.$mdDialog,
        },
        bindToController: true,
        controller: function Controller() {},
        controllerAs: '$ctrl',
        targetEvent: $event,
        autoWrap: false,
      })
      .then(list => {
        this.lists.push(list);
        this.handleChange();
        this.$state.go('.detail', { alias: list.alias, list });
      })
      .catch(() => {});
  }

  handleChange() {
    this.onUpdateLists({ lists: this.lists });
  }
}

export default {
  template,
  controller: ListsController,
  bindings: {
    lists: '<',
    canEdit: '<',
    onUpdateLists: '&',
  },
};

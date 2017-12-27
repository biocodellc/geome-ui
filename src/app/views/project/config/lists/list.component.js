import angular from 'angular';


class EditListController {
  $onInit() {
    this.list = Object.assign({}, this.list);
    this.caseSensitive = !this.list.caseInsensitive;
    this.duplicateValue = false;
  }

  $onDestroy() {
    if (!this.duplicateValue) {
      this.onUpdate({ list: this.list });
    }
  }

  validateValue() {
    const duplicates = this.lists.map(l => l.alias).filter(alias => this.list.alias === alias);
    this.duplicateValue = duplicates.length > 0;
  }
}

const fimsListEdit = {
  template: require('./edit-list.html'),
  controller: EditListController,
  bindings: {
    list: '<',
    lists: '<',
    onUpdate: '&',
    onClose: '&',
  },
};

export class ListController {
  handleOnUpdate(list) {
    if (!angular.equals(this.list, list)) {
      this.onUpdate({ list });
    }
  }
}

const fimsList = {
  template: require('./list.html'),
  controller: ListController,
  bindings: {
    list: '<',
    editing: '<',
    onRemove: '&',
    onUpdate: '&',
    onToggleEdit: '&',
  },
};


export default angular.module('fims.projectConfigList', [])
  .component('fimsList', fimsList)
  .component('fimsEditList', fimsListEdit)
  .name;

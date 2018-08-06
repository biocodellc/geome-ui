import angular from 'angular';

const template = require('./add-list.html');

class AddListController {
  $onInit() {
    this.caseSensitive = false;
    this.alias = undefined;
  }

  add() {
    const list = this.lists.find(l => l.alias === this.alias);

    if (list) {
      this.addForm.alias.$setValidity('unique', false);
      return;
    }

    this.onAddList({
      list: {
        fields: [],
        alias: this.alias,
        caseInsensitive: !this.caseSensitive,
      },
    });
  }
}

const fimsAddList = {
  template,
  controller: AddListController,
  bindings: {
    lists: '<',
    onAddList: '&',
  },
};

export default angular
  .module('fims.projectConfigAddList', [])
  .component('fimsAddList', fimsAddList).name;

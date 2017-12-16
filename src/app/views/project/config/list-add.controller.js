export default class AddListController {
  constructor($state, config) {
    this.$state = $state;
    this.config = config;

    this.caseSensitive = false;
    this.alias = undefined;
  }

  add() {
    const list = this.config.lists.find(l => l.alias === this.alias);
    if (list) {
      this.addForm.alias.$setValidity("unique", false);
    }

    this.config.lists.push({
      fields: [],
      alias: this.alias,
      caseInsensitive: !this.caseSensitive,
    });

    this.$state.go('^.detail', { alias: this.alias, addField: true });
  }
}

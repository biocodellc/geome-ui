import Rule from "./Rule";

export default class AddEntityController {
  constructor($state, config) {
    'ngInject'
    this.$state = $state;
    this.config = config;

    this.isChild = false;
    this.conceptAlias = undefined;
    this.conceptURI = undefined;
    this.parentEntity = undefined;

    this.entities = config.entities.map(c => c.conceptAlias);
  }

  add() {
    const e = this.config.entities.find(e => e.conceptAlias.toLowerCase() === this.conceptAlias.toLowerCase());

    if (e) {
      this.addForm.conceptAlias.$setValidity("unique", false);
    }

    const entity = {
      attributes: [],
      rules: [],
      conceptAlias: this.conceptAlias.toLowerCase(),
      parentEntity: this.parentEntity,
      conceptURI: this.conceptURI,
      editable: true,
      isNew: true,
    };

    if (this.parentEntity) {
      const rule = Rule.newRule("RequiredValue");
      rule.level = 'ERROR';
      const column = this.config.entityUniqueKey(this.parentEntity);
      rule.columns.push(column);

      entity.attributes.push({
        column: column,
        datatype: 'STRING',
        group: 'Default',
      });

      this.entity.rules.push(rule);
    }

    this.config.entities.push(entity);

    this.$state.go('^.detail.attributes', { alias: entity.conceptAlias, entity: entity, addAttribute: true });
  }
}

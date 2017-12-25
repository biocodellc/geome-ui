import { AVAILABLE_RULES, RULE_LEVELS } from "./Rule";

export default class AddRuleController {
  constructor($state, alerts, config, entity) {
    'ngInject'
    this.$state = $state;
    this.alerts = alerts;
    this.entity = entity;

    this.availableRules = AVAILABLE_RULES;
    this.rule = undefined;
    this.levels = RULE_LEVELS;

    this.lists = config.lists.map(l => l.alias);

    this.columns = entity.attributes.map(a => a.column);
  }

  add() {
    const metadata = this.rule.metadata();
    const invalidMetadata = Object.keys(metadata).map(k =>
      !metadata[ k ] || (Array.isArray(metadata[ k ]) && metadata[ k ].length === 0));

    if (invalidMetadata.length !== 0) {
      const msg = invalidMetadata.length > 1 ? ' are all required' : ' is required';

      this.alerts.error(invalidMetadata.join(', ') + msg);
      return;
    }

    // TODO verify this works
    if (this.entity.rules.includes(this.rule)) {
      this.alerts.error('That rule already exists.');
    }

    this.alerts.removeTmp();
    this.entity.rules.push(this.rule);
    this.$state.go('^');
  }
}

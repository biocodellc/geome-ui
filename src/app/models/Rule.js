const METADATA_TYPES = {
  column: 'column',
  columns: 'columns',
  uniqueAcrossProject: 'boolean',
  listName: 'list',
  minimumColumn: 'column',
  maximumColumn: 'column',
  pattern: 'string',
  caseInsensitive: 'boolean',
  range: 'string',
  otherColumn: 'column',
};

export const RULE_LEVELS = ['ERROR', 'WARNING'];

export default class Rule {
  constructor(props) {
    this.name = undefined;
    this.level = 'WARNING';

    Object.assign(this, props);
  }

  metadata() {
    return Object.keys(this).reduce((result, k) => {
      if (!['name', 'level'].includes(k)) {
        result[k] = this[k];
      }

      return result;
    }, {});
  }

  metadataType(key) {
    return METADATA_TYPES[key] || 'string';
  }

  static newRule(name) {
    return Object.assign({}, AVAILABLE_RULES.find(r => r.name === name));
  }
}

export const AVAILABLE_RULES = [
  new Rule({
    name: 'CompositeUniqueValue',
    columns: [],
  }),
  new Rule({
    name: 'ControlledVocabulary',
    column: undefined,
    listName: undefined,
  }),
  new Rule({
    name: 'MinMaxNumber',
    minimumColumn: undefined,
    maximumColumn: undefined,
  }),
  new Rule({
    name: 'NumericRange',
    column: undefined,
    range: undefined,
  }),
  new Rule({
    name: 'RegExp',
    column: undefined,
    pattern: undefined,
    caseInsensitive: true,
  }),
  new Rule({
    name: 'RequiredValueInGroup',
    columns: [],
  }),
  new Rule({
    name: 'RequiredValue',
    columns: [],
  }),
  new Rule({
    name: 'RequireValueIfOtherColumn',
    column: undefined,
    otherColumn: undefined,
  }),
  new Rule({
    name: 'UniqueValue',
    column: undefined,
    uniqueAcrossProject: false,
  }),
  new Rule({
    name: 'ValidForURI',
    column: undefined,
  }),
  new Rule({
    name: 'ValidURL',
    column: undefined,
  }),
];

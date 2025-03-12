export interface RuleProps {
    name?: string;
    level?: 'ERROR' | 'WARNING';
    column?: string;
    columns?: string[];
    listName?: string;
    minimumColumn?: string;
    maximumColumn?: string;
    pattern?: string;
    caseInsensitive?: boolean;
    range?: string;
    otherColumn?: string;
    uniqueAcrossProject?: boolean;
  }
  
  export class Rule {
    name: string;
    level: 'ERROR' | 'WARNING';
    column?: string;
    columns?: string[];
    listName?: string;
    minimumColumn?: string;
    maximumColumn?: string;
    pattern?: string;
    caseInsensitive?: boolean;
    range?: string;
    otherColumn?: string;
    uniqueAcrossProject?: boolean;
  
    constructor(props: RuleProps) {
      this.name = props.name || '';
      this.level = props.level || 'WARNING';
      Object.assign(this, props);
    }

    metadata() {
      return Object.keys(this).reduce((result:any, k:any) => {
        if (!['name', 'level'].includes(k)) result[k] = (this as any)[k];
        return result;
      }, {});
    }
  
    metadataType(key:any) {
      return METADATA_TYPES[key] || 'string';
    }
  
    static newRule(name: string): Rule | undefined {
      return AVAILABLE_RULES.find(rule => rule.name === name);
    }
  }
  
  export const AVAILABLE_RULES: Rule[] = [
    new Rule({ name: 'CompositeUniqueValue', columns: [] }),
    new Rule({ name: 'ControlledVocabulary', column: undefined, listName: undefined }),
    new Rule({ name: 'MinMaxNumber', minimumColumn: undefined, maximumColumn: undefined }),
    new Rule({ name: 'NumericRange', column: undefined, range: undefined }),
    new Rule({ name: 'RegExp', column: undefined, pattern: undefined, caseInsensitive: true }),
    new Rule({ name: 'RequiredValueInGroup', columns: [] }),
    new Rule({ name: 'RequiredValue', columns: [] }),
    new Rule({ name: 'RequireValueIfOtherColumn', column: undefined, otherColumn: undefined }),
    new Rule({ name: 'UniqueValue', column: undefined, uniqueAcrossProject: false }),
    new Rule({ name: 'ValidForURI', column: undefined }),
    new Rule({ name: 'ValidURL', column: undefined }),
  ];

  const METADATA_TYPES:any = {
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
  
  export const RULE_LEVELS: string[] = ['ERROR', 'WARNING'];
  
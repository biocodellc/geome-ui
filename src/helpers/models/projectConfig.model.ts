import { Rule } from "./rules.model";

export class ProjectConfig {
  entities: any[] = [];
  lists: any[] = [];
  expeditionMetadataProperties: any[] = [];
  private _worksheets?: string[];

  constructor(config?: any) {
    if (config) {
      Object.assign(this, config);

      this.entities = [...this.entities];
      this.lists = [...this.lists];
      this.expeditionMetadataProperties = [...this.expeditionMetadataProperties];

      this.entities.forEach(e => {
        e.rules = e.rules.map((r: any) => new Rule(r));
      });
    }
  }

  worksheets(): string[] {
    if (!this._worksheets) {
      const worksheets = new Set<string>();
      this.entities
        .filter(e => e.worksheet)
        .forEach(e => worksheets.add(e.worksheet));
      this._worksheets = Array.from(worksheets);
    }
    return this._worksheets;
  }

  addWorksheet(sheetName: string): void {
    this.worksheets().push(sheetName);
  }

  attributesByGroup(sheetName: string, includeRequired = true): Record<string, any[]> {
    const defaultGroup = 'Default Group';
    const attributes: Record<string, any[]> = {};
    const requiredAttributes = !includeRequired ? this.requiredAttributes(sheetName) : [];

    this.entities
      .filter(entity => entity.worksheet === sheetName)
      .forEach(e =>
        e.attributes.forEach((attribute:any) => {
          if (e.hashed && attribute.column === e.uniqueKey) return;
          if (!includeRequired && requiredAttributes.includes(attribute)) return;

          if (e.parentEntity) {
            const parentEntity = this.entities.find(en => en.conceptAlias === e.parentEntity);
            if (parentEntity?.hashed && attribute.column === parentEntity.uniqueKey) return;
          }

          const group = attribute.group || defaultGroup;
          attributes[group] = attributes[group] || [];

          if (!attributes[group].some(a => a.column === attribute.column)) {
            attributes[group].push(attribute);
          }
        }),
      );

    return attributes;
  }

  findAttributesByDefinition(sheetName: string, def: string): any[] {
    return this.entities
      .filter(entity => entity.worksheet === sheetName)
      .flatMap(e => e.attributes.filter((a:any) => a.definedBy === def));
  }

  findListForColumn(entity: any, column: string): any {
    const rule = entity.rules.find(
      (r: any) => r.name === 'ControlledVocabulary' && r.column === column
    );
    return rule ? this.getList(rule.listName) : undefined;
  }

  attributeRules(sheetName: string, attribute: any): any[] {
    const reservedKeys = ['name', 'level', 'listName'];
    return this.sheetRules(sheetName).filter(rule =>
      Object.keys(rule).some(k =>
        !reservedKeys.includes(k) &&
        ((Array.isArray(rule[k]) && rule[k].includes(attribute.column)) ||
          attribute.column === rule[k])
      )
    );
  }

  sheetRules(sheetName: string): any[] {
    return this.entities
      .filter(entity => entity.worksheet === sheetName)
      .flatMap(entity =>
        entity.rules.map((r: any) => ({ ...r, entity: entity.conceptAlias }))
      );
  }

  entityUniqueKey(conceptAlias: string): string | undefined {
    return this.entities.find(e => e.conceptAlias === conceptAlias)?.uniqueKey;
  }

  getList(listName: string): any {
    return this.lists.find(l => l.alias === listName) || {};
  }

  getRule(conceptAlias: string, ruleName: string, level: string): any {
    const entity = this.entities.find(e => e.conceptAlias === conceptAlias);
    if (!entity) return undefined;

    let rule = entity.rules.find((r: any) => r.name === ruleName && r.level === level);
    if (!rule) {
      rule = Rule.newRule(ruleName);
      rule.level = level;
      entity.rules.push(rule);
    }

    return rule;
  }

  requiredAttributes(sheetName: string): any[] {
    return this._requiredValueAttributes('ERROR', undefined, sheetName);
  }

  suggestedAttributes(sheetName: string): any[] {
    return this._requiredValueAttributes('WARNING', undefined, sheetName);
  }

  requiredAttributesForEntity(conceptAlias: string): any[] {
    return this._requiredValueAttributes('ERROR', conceptAlias);
  }

  private _requiredValueAttributes(level: string, conceptAlias?: string, sheetName?: string): any[] {
    return this.entities
      .filter(e => (!sheetName || e.worksheet === sheetName) && (!conceptAlias || e.conceptAlias === conceptAlias))
      .flatMap(e => {
        const requiredColumns = Array.from(
          new Set(
            e.rules
              .filter((r: any) => r.name === 'RequiredValue' && r.level === level)
              .flatMap((r: any) => r.columns)
              .filter((c:any) => {
                if (e.hashed && c === e.uniqueKey) return false;
                const parentEntity = this.entities.find(en => en.conceptAlias === e.parentEntity);
                return !(parentEntity?.hashed && c === parentEntity.uniqueKey);
              })
          )
        );

        if (level === 'ERROR' && e.type === 'Photo') {
          requiredColumns.push('originalUrl');
        }

        return e.attributes.filter((a: any) => requiredColumns.includes(a.column));
      });
  }
}

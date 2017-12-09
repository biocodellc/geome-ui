import Rule from "./Rule";

export default class ProjectConfig {
  constructor(config) {
    Object.assign(this, config);

    this.entities.forEach((e) => {
      e.rules = e.rules.map(r => new Rule(r));
    });
  }

  worksheets() {
    // we don't want to compare the $worksheets variable when determining if 2 configs are the same
    // using angular.equals(); By prefixing the variable with "$", angular will ignore this property
    // during comparison
    if (this.$worksheets) {
      return this.$worksheets;
    } else {
      this.$worksheets = [];

      var self = this;
      angular.forEach(this.entities, function (entity) {
        if (entity.worksheet && self.$worksheets.indexOf(entity.worksheet) === -1) {
          self.$worksheets.push(entity.worksheet);
        }
      });

      return this.$worksheets;
    }
  }

  attributesByGroup(sheetName) {
    var attributes = {
      'Default Group': [],
    };

    angular.forEach(this.entities, function (entity) {
      if (entity.worksheet === sheetName) {

        angular.forEach(entity.attributes, function (attribute) {

          if (attribute.group) {
            if (Object.keys(attributes).indexOf(attribute.group) === -1) {
              attributes[ attribute.group ] = [];
            }

            attributes[ attribute.group ].push(attribute);

          } else {
            attributes[ 'Default Group' ].push(attribute);
          }
        })
      }
    });

    return attributes;
  }

  attributeRules(sheetName, attribute) {
    var reservedKeys = [ 'name', 'level', 'listName' ];
    var sheetRules = this.sheetRules(sheetName);
    var attrRules = [];

    angular.forEach(sheetRules, function (rule) {
      angular.forEach(rule, function (val, key) {

        // if this is not a reservedKey, then check the val for the attribute.column
        if (reservedKeys.indexOf(key) === -1) {
          if ((angular.isArray(val) && val.indexOf(attribute.column) > -1)
            || attribute.column === val) {
            attrRules.push(rule);
          }
        }

      });
    });

    return attrRules;
  }

  sheetRules(sheetName) {
    var sheetRules = [];

    angular.forEach(this.entities, function (entity) {
      if (entity.worksheet === sheetName) {
        sheetRules = sheetRules.concat(entity.rules);
      }
    });

    return sheetRules;
  }

  entityUniqueKey(conceptAlias) {

    for (var i = 0; i < this.entities.length; i++) {
      if (this.entities[ i ].conceptAlias === conceptAlias) {
        return this.entities[ i ].uniqueKey;
      }
    }
  }

  getList(listName) {
    for (var i = 0; i < this.lists.length; i++) {
      if (this.lists[ i ].alias === listName) {
        return this.lists[ i ];
      }
    }

    return [];
  }

  getRule(conceptAlias, ruleName, level) {
    var rule,
      i,
      entity = this._getEntity(conceptAlias);

    if (entity) {
      for (i = 0; i < entity.rules.length; i++) {
        rule = entity.rules[ i ];

        if (rule.name === ruleName && rule.level === level) {
          return rule;
        }
      }

      rule = Rule.newRule(ruleName);
      rule.level = level;
      entity.rules.push(rule);

      return rule;
    }

  }

  requiredAttributes(sheetName) {
    return this._requiredValueAttributes(sheetName, 'ERROR');
  }

  suggestedAttributes(sheetName) {
    return this._requiredValueAttributes(sheetName, 'WARNING');
  }

  ruleLevels() {
    return [ 'ERROR', 'WARNING' ];
  }

  _getEntity(conceptAlias) {
    for (var i = 0; i < this.entities.length; i++) {
      if (this.entities[ i ].conceptAlias === conceptAlias) {
        return this.entities[ i ];
      }
    }
  }

  _requiredValueAttributes(sheetName, level) {
    var attributes = [];

    angular.forEach(this.entities, function (entity) {
      if (entity.worksheet === sheetName) {

        var requiredColumns = [];

        angular.forEach(entity.rules, function (rule) {
          if (rule.name == 'RequiredValue' && rule.level === level) {
            requiredColumns = requiredColumns.concat(rule.columns);
          }
        });

        angular.forEach(entity.attributes, function (attribute) {
          if (requiredColumns.indexOf(attribute.column) > -1) {
            attributes.push(attribute);
          }
        });

      }
    });

    return attributes;
  }
}

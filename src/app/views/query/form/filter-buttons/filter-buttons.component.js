const template = require('./filter-buttons.html');

const queryTypes = {
  list: ['=', 'has'],
  string: ['=', 'like', 'has'],
  float: ['=', '<', '<=', '>', '>=', 'has'],
  datetime: ['=', '<', '<=', '>', '>=', 'has'],
  date: ['=', '<', '<=', '>', '>=', 'has'],
  integer: ['=', '<', '<=', '>', '>=', 'has'],
};

class FilterButtonsController {
  generateFilterOptions() {
    if (!this.filterOptions) {
      this.filterOptions = {};
      this.currentConfig.entities.forEach(e => {
        const alias = e.conceptAlias;
        const opts = e.attributes
          .filter(a => !a.internal)
          .map(a => ({
            column: `${alias}.${a.column}`,
            dataType: a.dataType,
            list: this.currentConfig.findListForColumn(e, a.column),
          }));
        this.filterOptions[alias] = opts;
        this.filterOptions[alias].sort((a, b) =>
          a.column > b.column ? 1 : b.column > a.column ? -1 : 0,
        );
      });
    }
    const filter = { type: '=' };
    if (this.conceptAlias === 'Event') {
      filter.column = 'Event.eventID';
      this.filter.push(filter);
    } else if (this.conceptAlias === 'Sample') {
      filter.column = 'Sample.materialSampleID';
      this.filter.push(filter);
    } else if (this.conceptAlias === 'Tissue') {
      filter.column = 'Tissue.tissueID';
      this.filter.push(filter);
    } else if (this.conceptAlias === 'Sample_Photo') {
      filter.column = 'Sample_Photo.photoID';
      this.filter.push(filter);
    } else if (this.conceptAlias === 'Event_Photo') {
      filter.column = 'Event_Photo.photoID';
      this.filter.push(filter);
    }
    this.createArrayOfAttributesWithLists();
    this.filterToggle(filter);
  }

  createArrayOfAttributesWithLists() {
    this.controlledVocabAttributes = [];
    this.currentConfig.entities.forEach(e => {
      const allAliases = e.conceptAlias;
      this.filterOptions[allAliases].forEach(o => {
        if (o.list) {
          this.controlledVocabAttributes.push(o.column);
        }
      });
    });
  }

  filterToggle(chip, removal) {
    if (!removal) {
      this.params.filters.push(chip);
    } else if (removal) {
      const index = this.params.filters.indexOf(chip);
      this.params.filters.splice(index, 1);
    }
  }

  getQueryTypes(conceptAlias, column) {
    const opt = this.filterOptions[conceptAlias].find(o => o.column === column);
    if (opt) {
      if (opt.list) {
        return queryTypes.list;
      }
      return queryTypes[opt.dataType.toLowerCase()];
    }
    return [];
  }

  getList(conceptAlias, column) {
    const opt = this.filterOptions[conceptAlias].find(o => o.column === column);
    return opt.list ? opt.list.fields : [];
  }
}

export default {
  template,
  controller: FilterButtonsController,
  bindings: {
    params: '<',
    conceptAlias: '<',
    currentConfig: '<',
    filter: '<',
  },
};

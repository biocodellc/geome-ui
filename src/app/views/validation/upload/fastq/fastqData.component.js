const template = require('./fastqData.html');

class FastqDataController {
  $onChanges(changesObj) {
    if ('data' in changesObj) {
      this.data = Object.assign({}, this.data);
    }

    if ('config' in changesObj && changesObj.config.currentValue) {
      this.libraryStrategies = this.config
        .getList('libraryStrategy')
        .fields.map(f => f.value);
      this.librarySources = this.config
        .getList('librarySource')
        .fields.map(f => f.value);
      this.librarySelections = this.config
        .getList('librarySelection')
        .fields.map(f => f.value);
      this.platforms = {};

      this.platforms = this.config
        .getList('platform')
        .fields.reduce((val, f) => {
          val[f.value] = this.config
            .getList(f.value)
            .fields.map(field => field.value);
          return val;
        }, {});
    }
  }

  dataChanged() {
    this.onChange({ data: this.data });
  }
}

export default {
  template,
  controller: FastqDataController,
  bindings: {
    data: '<',
    form: '<',
    config: '<',
    onChange: '&',
  },
};

const template = require('./fastaData.html');

class FastaDataController {
  $onInit() {
    this.data = this.data ? this.data.slice() : [];
    if (this.data.length === 0) {
      this.addData();
    }
  }

  $onChanges(changesObj) {
    if ('data' in changesObj) {
      this.data = changesObj.data.currentValue.slice();
    }

    if ('config' in changesObj && changesObj.config.currentValue) {
      this.markers = this.config.getList('markers').fields || [];
    }
  }

  removeData() {
    this.data.pop();
    this.dataChanged();
  }

  addData() {
    this.data.push({
      file: undefined,
      marker: undefined,
    });
  }

  dataChanged() {
    this.onChange({ data: this.data });
  }
}

export default {
  template,
  controller: FastaDataController,
  bindings: {
    data: '<',
    form: '<',
    config: '<',
    onChange: '&',
  },
};

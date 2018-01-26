// TODO finish this
class FastqDataController {
  $onChanges(changesObj) {
    if ('data' in changesObj) {
      this.data = Object.assign({}, this.data);
    }

    if ('config' in changesObj && changesObj.config.currentValue) {
      this.fastqMetadataLists = this.config.getList('fastqMetadata');
    }
  }

  dataChanged() {
    this.onChange({ data: this.data });
  }
}

export default {
  template: require('./fastqData.html'),
  controller: FastqDataController,
  bindings: {
    data: '<',
    form: '<',
    config: '<',
    onChange: '&',
  },
};

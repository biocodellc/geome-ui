const template = require('./query-table.html');

class QueryTableController {
  constructor($window, $state) {
    'ngInject';

    this.$window = $window;
    this.$state = $state;
  }

  $onInit() {
    this.tableColumns = [
      'eventID',
      'materialSampleID',
      'locality',
      'decimalLatitude',
      'decimalLongitude',
      'yearCollected',
      'phylum',
      'genus',
      'specificEpithet',
      'bcid',
    ];
    this.tableData = [];
    this.currentPage = 1;
    this.pageSize = 50;
  }

  $onChanges(changesObj) {
    if ('results' in changesObj) {
      this.currentPage = 1;
      this.updatePage();
    }
  }

  updatePage() {
    if (!this.results) return;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    const data = this.results.data.slice(start, end);

    this.prepareTableData(data);
  }

  detailView(resource) {
    const bcidIndex = this.tableColumns.indexOf('bcid');
    this.$window.open(
      this.$state.href('record', {
        bcid: resource[bcidIndex],
      }),
    );
  }
 
  /*
  transform the data into an array so we can use sly-repeat to display it. sly-repeat bypasses the $watches
  greatly improving the performance of sizable tables
  */
  prepareTableData(data) {
    this.tableData = data.map(sample =>
      this.tableColumns.map(key => sample[key] || sample.event[key]),
    );
  }
}

export default {
  template,
  controller: QueryTableController,
  bindings: {
    results: '<',
  },
};

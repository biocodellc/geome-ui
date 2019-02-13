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
      'scientificName',
      'expeditionCode',
      'bcid',
    ];
    this.tableData = [];
    this.currentPage = 1;
    this.pageSize = 50;
    this.limitOptions = [25, 50, 100];
  }

  $onChanges(changesObj) {
    if ('results' in changesObj) {
      this.currentPage = 1;
    }
  }

  detailView(resource) {
    this.$window.open(
      this.$state.href('record', {
        bcid: resource.bcid,
      }),
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

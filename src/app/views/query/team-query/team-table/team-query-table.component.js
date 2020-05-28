/* AMPHIBIAN DISEASE TEAM'S TABLE */
const template = require('./team-query-table.html');

class TeamQueryTableController {
  constructor($window, $state) {
    'ngInject';

    this.$window = $window;
    this.$state = $state;
  }

  $onInit() {
    this.tableColumns = [
      'materialSampleID',
      'locality',
      'decimalLatitude',
      'decimalLongitude',
      'yearCollected',
      'scientificName',
      'expeditionCode',
      'bcid',
    ];
    this.tableData = [];
    this.currentPage = 1;
    this.pageSize = 50;
    this.limitOptions = [25, 50, 100];
  }

  getVal(record, column) {
    return typeof column === 'string' ? record[column] : column.get(record);
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
  controller: TeamQueryTableController,
  bindings: {
    results: '<',
    entity: '<',
  },
};

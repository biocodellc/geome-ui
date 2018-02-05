import QueryMap from './QueryMap';
import QueryResults from './QueryResults';
import QueryParams from './QueryParams';

const template = require('./query.html');

class QueryController {
  constructor($state, queryService) {
    'ngInject';

    this.$state = $state;
    this.queryService = queryService;
  }

  $onInit() {
    this.params = new QueryParams();
    this.results = new QueryResults();
    this.queryMap = new QueryMap(
      this.$state,
      'decimalLatitude',
      'decimalLongitude',
    );

    this.showSidebar = true;
    this.showMap = true;
    this.sidebarToggleToolTip = 'hide sidebar';
    this.invalidSize = false;
  }

  downloadExcel() {
    this.queryService.downloadExcel(this.queryParams.build());
  }

  downloadCsv() {
    this.queryService.downloadCsv(this.queryParams.build());
  }

  downloadKml() {
    this.queryService.downloadKml(this.queryParams.build());
  }

  downloadFasta() {
    this.queryService.downloadFasta(this.queryParams.build());
  }

  downloadFastq() {
    this.queryService.downloadFastq(this.queryParams.build());
  }

  hasFastqData() {
    return this.queryResults.data.some(d => d.fastqMetadata);
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    this.sidebarToggleToolTip = this.showSidebar
      ? 'hide sidebar'
      : 'show sidebar';

    this.invalidSize = true;
  }

  toggleMap(show) {
    this.invalidSize = this.showMap !== show;
    this.showMap = show;
  }
}

export default {
  template,
  controller: QueryController,
  bindings: {
    expeditions: '<',
    markers: '<',
    filterOptions: '<',
  },
};

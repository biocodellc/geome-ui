import QueryMap from './QueryMap';
import QueryParams from './QueryParams';

const template = require('./query.html');

class QueryController {
  constructor($state, QueryService) {
    'ngInject';

    this.$state = $state;
    this.QueryService = QueryService;
  }

  $onInit() {
    this.params = new QueryParams();
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

  handleNewResults(results) {
    this.results = results;
  }

  downloadExcel() {
    this.QueryService.downloadExcel(
      this.queryParams.build(),
      this.currentProject.config.entities[0].conceptAlias,
    );
  }

  downloadCsv() {
    this.QueryService.downloadCsv(
      this.queryParams.build(),
      this.currentProject.config.entities[0].conceptAlias,
    );
  }

  downloadKml() {
    this.QueryService.downloadKml(
      this.queryParams.build(),
      this.currentProject.config.entities[0].conceptAlias,
    );
  }

  downloadFasta() {
    this.QueryService.downloadFasta(this.queryParams.build(), 'fastaSequence');
  }

  downloadFastq() {
    this.QueryService.downloadFastq(this.queryParams.build(), 'fastqMetadata');
  }

  hasFastqData() {
    return this.results && this.results.data.some(d => d.fastqMetadata);
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
    currentProject: '<',
    expeditions: '<',
    markers: '<',
    filterOptions: '<',
  },
};

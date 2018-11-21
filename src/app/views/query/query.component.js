import QueryMap from './QueryMap';
import QueryParams from './QueryParams';

const template = require('./query.html');

// TODO: disable download button if no results are found
class QueryController {
  constructor($state, $timeout, $location, QueryService, StorageService) {
    'ngInject';

    this.$state = $state;
    this.$timeout = $timeout;
    this.$location = $location;
    this.QueryService = QueryService;
    this.StorageService = StorageService;
  }

  $onInit() {
    this.params = new QueryParams();
    this.queryMap = new QueryMap(
      this.$state,
      'event.decimalLatitude',
      'event.decimalLongitude',
    );

    this.showSidebar = true;
    this.showMap = true;
    this.loading = false;
    this.sidebarToggleToolTip = 'hide sidebar';
  }

  handleNewResults(results) {
    this.results = results;
  }

  downloadExcel() {
    this.loading = true;
    this.QueryService.downloadExcel(
      this.params.buildQuery(this.entities),
      'Event',
    ).finally(() => {
      this.loading = false;
    });
  }

  downloadCsv() {
    this.loading = true;
    this.QueryService.downloadCsv(
      this.params.buildQuery(this.entities),
      'Event',
    ).finally(() => {
      this.loading = false;
    });
  }

  downloadFasta() {
    this.loading = true;
    this.QueryService.downloadFasta(
      this.params.buildQuery(this.entities.concat(['Event'])),
      'fastaSequence',
    ).finally(() => {
      this.loading = false;
    });
  }

  selectEntities(entities) {
    this.entities = entities;
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    this.sidebarToggleToolTip = this.showSidebar
      ? 'hide sidebar'
      : 'show sidebar';

    this.resizeMap();
  }

  toggleMap(show) {
    if (this.showMap !== show) this.resizeMap();
    this.showMap = show;
  }

  resizeMap() {
    this.$timeout(() => this.queryMap.refreshSize(), 500);
  }

  toggleLoading(val) {
    this.loading = val;
  }
}

export default {
  template,
  controller: QueryController,
  bindings: {
    currentUser: '<',
    layout: '@',
    layoutFill: '@',
  },
};

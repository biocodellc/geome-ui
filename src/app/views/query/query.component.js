import QueryMap from './QueryMap';
import QueryParams from './QueryParams';

const template = require('./query.html');

class QueryController {
  constructor($state, $timeout, QueryService, StorageService) {
    'ngInject';

    this.$state = $state;
    this.$timeout = $timeout;
    this.QueryService = QueryService;
    this.StorageService = StorageService;
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
    this.loading = false;
    this.sidebarToggleToolTip = 'hide sidebar';
  }

  handleNewResults(results, isAdvancedSearch) {
    // when switching between simple and advanced searches
    this.results = results;
    if (!results) {
      this.toggleMap(true);
    } else {
      const hasCoordinates = this.results.data.some(
        d => d.decimalLatitude && d.decimalLongitude,
      );
      // return table view for advanced queries and queries with no lat lng data, return map view for simple queries
      if (!hasCoordinates || isAdvancedSearch) {
        this.toggleMap(false);
      } else {
        this.toggleMap(true);
      }
    }
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

  downloadableEntities(entities) {
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

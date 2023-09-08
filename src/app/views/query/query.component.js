import QueryMap from './QueryMap';
import QueryParams from './QueryParams';

const template = require('./query.html');

class QueryController {
  constructor($state, $timeout, $location, QueryService) {
    'ngInject';

    this.$state = $state;
    this.$timeout = $timeout;
    this.$location = $location;
    this.QueryService = QueryService;
  }
  $onInit() {
    const teamIdFromUrlParam = this.$location.search().team;
    this.teamIdNum = parseInt(teamIdFromUrlParam, 10);
    // For now, we just check for team ID of Amphibian Disease
    if (teamIdFromUrlParam && this.teamIdNum === 45) {
      this.teamQuery = true;
    }

    this.params = new QueryParams();
    this.queryMap = new QueryMap(
      this.$state,
      'decimalLatitude',
      'decimalLongitude',
    );

    this.showSidebar = true;
    this.showMap = true;
    this.showTable = false;
    this.showPhoto = false;

    this.loading = false;
    this.sidebarToggleToolTip = 'hide sidebar';
  }

  handleNewResults(results, entity, isAdvancedSearch) {
    // when switching between simple and advanced searches
    this.results = results;
    this.entity = entity;
    if (!results) {
      this.toggleMap(true);
    } else {
      const hasCoordinates = this.results.data.some(
        d => d.decimalLatitude && d.decimalLongitude,
      );
      // return table view for advanced queries and queries with no lat lng data, return map view for simple queries
      //if (!hasCoordinates || isAdvancedSearch) {
      //  this.toggleMap(false);
      //} else {
      //  this.toggleMap(true);
     // }
    }
  }

  downloadExcel() {
    this.loading = true;
    this.QueryService.downloadExcel(
      this.params.buildQuery(this.entities),
      this.entity,
    ).finally(() => {
      this.loading = false;
    });
  }

  downloadCsv() {
    this.loading = true;
    this.QueryService.downloadCsv(
      this.params.buildQuery(this.entities),
      this.entity,
    ).finally(() => {
      this.loading = false;
    });
  }

  downloadFasta() {
    this.loading = true;
    this.QueryService.downloadFasta(
      this.params.buildQuery(this.entities.concat(['Sample'])),
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

  toggleTable(show) {
    if (show) {
      this.showTable = true;
      this.showMap = false;
      this.showPhoto = false;      
    }
  }
togglePhoto(show) {
  if (show) {
    this.showPhoto = true;
    this.showMap = false;
    this.showTable = false;
  }
}

  toggleMap(show) {
    if (this.showMap !== show) this.resizeMap();
    if (show) {
      this.showMap = true;
      this.showPhoto = false;
      this.showTable = false;     
    }
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
    projects: '<',
    layout: '@',
    layoutFill: '@',
  },
};

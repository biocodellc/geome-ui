import angular from 'angular';

const template = require('./query-form.html');

const SOURCE = [
  'urn:principalInvestigator',
  'urn:materialSampleID',
  'urn:locality',
  'urn:country',
  'urn:decimalLatitude',
  'urn:decimalLongitude',
  'urn:genus',
  'urn:species',
  'fastqMetadata',
  'bcid',
];

const defaultFilter = {
  field: null,
  type: null,
  value: null,
};

class QueryFormController {
  constructor($timeout, QueryService, usSpinnerService) {
    'ngInject';

    this.$timeout = $timeout;
    this.QueryService = QueryService;
    this.usSpinnerService = usSpinnerService;
  }

  $onInit() {
    this.addFilter();

    // view toggles
    this.moreSearchOptions = false;
    this.showMap = true;
    this.showSequences = true;
    this.showHas = true;
    this.showDWC = true;
    this.showExpeditions = true;
    this.showFilters = true;

    this.drawing = false;
  }

  addFilter() {
    const filter = Object.assign({}, defaultFilter, {
      field: this.filterOptions[0].displayName,
      type: this.filterOptions[0].queryTypes[0],
    });
    this.params.filters.push(filter);
  }

  removeFilter(index) {
    this.params.filters.splice(index, 1);
  }

  queryJson() {
    // TODO: make this a loading bool & use us-spinner directive
    this.usSpinnerService.spin('query-spinner');

    this.QueryService.queryJson(
      this.params.buildQuery(SOURCE.join()),
      this.currentProject.projectId,
      0,
      10000,
    )
      .then(results => {
        this.onNewResults({ results });
        this.queryMap.clearBounds();
        // this.queryMap.setMarkers(this.queryResults.data); TODO: fix this
      })
      .catch(response => {
        angular.exception.catcher('Failed to load query results')(response);
        this.onNewResults({ results: undefined });
      })
      .finally(() => {
        this.usSpinnerService.stop('query-spinner');
      });
  }

  getFilterList(filterIndex) {
    const { field } = this.params.filters[filterIndex];
    const opt = this.filterOptions.findOne(o => o.displayName === field);
    return opt && opt.list.length > 0 ? opt.list : null;
  }

  getQueryTypes(filterIndex) {
    const filter = this.params.filters[filterIndex];
    const opt = this.filterOptions.findOne(o => o.displayName === filter.field);

    return opt ? opt.queryTypes : null;
  }

  resetFilter(filterIndex) {
    const filter = this.params.filters[filterIndex];
    filter.value = null;
    filter.type = 'EQUALS';
  }

  drawBounds() {
    this.drawing = true;
    this.queryMap.drawBounds(bounds => {
      this.queryParams.bounds = bounds;
      this.$timeout(() => {
        this.drawing = false;
      });
    });
  }

  clearBounds() {
    this.queryMap.clearBounds();
    this.queryParams.bounds = null;
  }
}

export default {
  template,
  controller: QueryFormController,
  bindings: {
    params: '<',
    queryMap: '<',
    expeditions: '<', // list of expeditionCodes
    currentProject: '<',
    markers: '<',
    filterOptions: '<',
    onNewResults: '&',
  },
};

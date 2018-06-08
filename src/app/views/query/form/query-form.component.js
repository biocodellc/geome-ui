import angular from 'angular';

const template = require('./query-form.html');

const SOURCE = [
  'principalInvestigator',
  'materialSampleID',
  'locality',
  'country',
  'decimalLatitude',
  'decimalLongitude',
  'genus',
  'species',
  // 'fastqMetadata',
  'bcid',
];

const defaultFilter = {
  column: null,
  type: null,
  value: null,
};

const queryTypes = {
  string: ['=', 'like', 'has'],
  float: ['=', '<', '<=', '>', '>=', 'has'],
  datetime: ['=', '<', '<=', '>', '>=', 'has'],
  date: ['=', '<', '<=', '>', '>=', 'has'],
  integer: ['=', '<', '<=', '>', '>=', 'has'],
};

class QueryFormController {
  constructor($timeout, $window, QueryService) {
    'ngInject';

    this.$timeout = $timeout;
    this.$window = $window;
    this.QueryService = QueryService;
  }

  $onInit() {
    this.hasFastqEntity = false;

    // view toggles
    this.moreSearchOptions = true;
    this.showMap = true;
    this.showSequences = true;
    this.showHas = true;
    this.showDWC = true;
    this.showExpeditions = true;
    this.showFilters = true;

    this.drawing = false;
  }

  $onChanges(changesObj) {
    if ('currentProject' in changesObj && this.currentProject) {
      const { config } = this.currentProject;
      const list = config.getList('markers');

      this.markers = list ? list.fields : [];
      this.hasFastqEntity = config.entities.some(e => e.type === 'Fastq');

      this.generateFilterOptions();
      // if (this.params.filters.length === 0) this.addFilter();
    }

    if (
      'expeditions' in changesObj &&
      this.expeditions &&
      this.expeditions.length > 0
    ) {
      this.expeditions.sort((a, b) => {
        if (a.expeditionTitle < b.expeditionTitle) return -1;
        if (a.expeditionTitle > b.expeditionTitle) return 1;
        return 0;
      });
    }
  }

  addFilter() {
    const filter = Object.assign({}, defaultFilter, {
      column: this.filterOptions[0].column,
      type: this.getQueryTypes(this.filterOptions[0].column)[0],
    });
    this.params.filters.push(filter);
  }

  queryJson() {
    this.toggleLoading({ val: true });

    const { projectId } = this.currentProject;

    this.QueryService.queryJson(
      this.params.buildQuery(projectId, SOURCE.join()),
      this.currentProject.config.entities[0].conceptAlias,
      0,
      10000,
    )
      .then(results => {
        this.onNewResults({ results });
        this.queryMap.clearBounds();
        this.queryMap.setMarkers(results.data);
      })
      .catch(response => {
        angular.catcher('Failed to load query results')(response);
        this.onNewResults({ results: undefined });
      })
      .finally(() => {
        this.toggleLoading({ val: false });
      });
  }

  helpDocs() {
    const newWin = this.$window.open(
      'http://fims.readthedocs.io/en/latest/fims/query.html',
      '_blank',
    );

    if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
      angular.toaster('It appears you have a popup blocker enabled');
    }
  }

  getQueryTypes(column) {
    const opt = this.filterOptions.find(o => o.column === column);
    return opt ? queryTypes[opt.dataType.toLowerCase()] : [];
  }

  drawBounds() {
    this.drawing = true;
    this.queryMap.drawBounds(bounds => {
      this.params.bounds = bounds;
      this.$timeout(() => {
        this.drawing = false;
      });
    });
  }

  clearBounds() {
    this.queryMap.clearBounds();
    this.params.bounds = null;
  }

  filterExpeditions(query) {
    return this.expeditions.filter(
      e =>
        !this.params.expeditions.includes(e) &&
        (!query ||
          e.expeditionTitle.toLowerCase().includes(query.toLowerCase())),
    );
  }

  generateFilterOptions() {
    const { config } = this.currentProject;
    this.filterOptions = config.entities[0].attributes.map(a => ({
      group: a.group || 'Default Group',
      column: a.column,
      dataType: a.dataType,
      list: config.findListForColumn(config.entities[0], a.column),
    }));
    this.filterOptionsGroups = config.entities[0].attributes.reduce(
      (val, a) => {
        const g = a.group || 'Default Group';
        if (!val.includes(g)) val.push(g);
        return val;
      },
      [],
    );
  }
}

export default {
  template,
  controller: QueryFormController,
  bindings: {
    params: '<',
    queryMap: '<',
    expeditions: '<', // list of expeditions
    currentUser: '<',
    currentProject: '<',
    onProjectChange: '&',
    onNewResults: '&',
    toggleLoading: '&',
  },
};

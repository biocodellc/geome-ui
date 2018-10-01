import angular from 'angular';

const template = require('./query-form.html');

const SOURCE = [
  'Event.eventID',
  'Sample.eventID',
  'Sample.materialSampleID',
  'locality',
  'country',
  'yearCollected',
  'decimalLatitude',
  'decimalLongitude',
  'Sample.genus',
  'Sample.specificEpithet',
  'fastqMetadata.identifier',
  'fastqMetadata.identifier',
  'Event.bcid',
  'Sample.bcid',
  'Sample.phylum',
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

const PROJECT_RE = new RegExp(/_projects_:\s*(\d+)|(\[[\s\d,]+])/);
const EXPEDITION_RE = new RegExp(/_expeditions_:\s*(\w+)|(\[[\s\w,]+])/);

const parseExpeditionQueryString = s =>
  s
    .replace('[', '')
    .replace(']', '')
    .split(',');

class QueryFormController {
  constructor(
    $scope,
    $timeout,
    $window,
    $location,
    QueryService,
    ProjectService,
  ) {
    'ngInject';

    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$window = $window;
    this.$location = $location;
    this.QueryService = QueryService;
    this.ProjectService = ProjectService;
    this.configGroups = [];
  }

  $onInit() {
    this.hasFastqEntity = this.currentProject
      ? this.currentProject.config.entities.some(e => e.type === 'Fastq')
      : false;

    // view toggles
    this.moreSearchOptions = true;
    this.showMap = true;
    this.showSequences = true;
    this.showHas = true;
    this.showDWC = true;
    this.showExpeditions = true;
    this.showFilters = true;
    this.resetExpeditions = true;
    this.showProjects = true;

    this.drawing = false;

    const { q } = this.$location.search();

    if (q) {
      const projectMatch = PROJECT_RE.exec(q);
      if (projectMatch) {
        if (projectMatch[1]) {
          // single project
          this.ProjectService.get(parseInt(projectMatch[1], 10), false).then(
            p => {
              this.onProjectChange({ project: p });
            },
          );
        } else {
          // TODO handle this case
          // projects array
          // const projects = this.$scope.$eval(projectMatch[2]);
        }
        // const expeditionMatch = EXPEDITION_RE.exec(q);
        // if (expeditionMatch) {
        //   this.resetExpeditions = false;
        //   const e =
        //     expeditionMatch[1] ||
        //     parseExpeditionQueryString(expeditionMatch[2]);

        //   this.params.expeditions.push(...e);
        // }
      }
      this.params.queryString = q;
      this.queryJson();
    }
  }

  $onChanges(changesObj) {
    this.params.projects = [];

    this.ProjectService.all(true).then(({ data }) => {
      this.projects = data;
      let configs = new Set();
      this.projects.forEach(e => {
        configs.add(e.projectConfiguration.name);
        return configs;
      });
      this.configNames = Array.from(configs);
    });

    if ('currentProject' in changesObj && this.currentProject) {
      const { config } = this.currentProject;
      const list = config.getList('markers');

      this.markers = list ? list.fields : [];
      this.hasFastqEntity = config.entities.some(e => e.type === 'Fastq');

      this.generateFilterOptions();
      if (this.resetExpeditions) {
        console.log('resetting');
        this.params.expeditions = [];
      } else {
        this.resetExpeditions = true;
      }
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

  clearParams() {
    this.params.projects = [];
    this.configGroups = [];
  }

  // update autocomplete list
  updateList(chip) {
    const index = this.projects.indexOf(chip);
    this.projects.includes(chip)
      ? this.projects.splice(index, 1)
      : this.projects.unshift(chip);
  }

  addGroup(chip) {
    // update parameters
    this.projects.forEach(p => {
      if (p.projectConfiguration.name === chip) this.params.projects.push(p);
    });
    // update autocomplete
    const index = this.configNames.indexOf(chip);
    this.configNames.splice(index, 1);
  }

  removeGroup(chip) {
    // update parameters
    this.projects.forEach(p => {
      if (p.projectConfiguration.name === chip)
        var index = this.params.projects.indexOf(p);
      if (index > -1) {
        this.params.projects.splice(index, 1);
      }
    });
    // update md-autocomplete
    this.configNames.unshift(chip);
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

    const projectId = this.currentProject
      ? this.currentProject.projectId
      : undefined;

    /*
    const projectIds = new Set();
    this.params.projects.forEach((p) => projectIds.add(p.projectId))
    console.log(projectIds)
    */

    const selectEntities = ['Sample', 'fastqMetadata'];

    this.QueryService.queryJson(
      this.params.buildQuery(projectId, selectEntities, SOURCE.join()),
      'Event',
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
    this.filterOptions = config.entities.reduce(
      (accumulator, entity) =>
        accumulator.concat(
          entity.attributes.filter(a => !a.internal).map(a => ({
            group: a.group
              ? `${entity.conceptAlias} ${a.group}`
              : `${entity.conceptAlias} Default Group`,
            column: `${entity.conceptAlias}.${a.column}`,
            dataType: a.dataType,
            list: config.findListForColumn(entity, a.column),
          })),
        ),
      [],
    );
    this.filterOptionsGroups = this.filterOptions.reduce((accumulator, a) => {
      if (!accumulator.includes(a.group)) accumulator.push(a.group);
      return accumulator;
    }, []);
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

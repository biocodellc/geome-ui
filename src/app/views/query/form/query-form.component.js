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
    NetworkConfigurationService,
    ProjectConfigurationService,
    ExpeditionService,
  ) {
    'ngInject';

    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$window = $window;
    this.$location = $location;
    this.QueryService = QueryService;
    this.ProjectService = ProjectService;
    this.NetworkConfigurationService = NetworkConfigurationService;
    this.ProjectConfigurationService = ProjectConfigurationService;
    this.ExpeditionService = ExpeditionService;
  }

  $onInit() {
    this.showGroups = true;
    this.loading = true;
    this.resetExpeditions = true;
    this.params.projects = [];
    this.params.events = [];
    this.configGroups = [];
    this.individualProject = [];
    this.events = [];
    this.specimens = [];
    this.tissues = [];

    // Retrieve Projects
    this.ProjectService.all(true)
      .then(({ data }) => {
        this.projects = data;
        let names = new Set();
        this.projects.forEach(e => {
          names.add(e.projectConfiguration.name);
          return names;
        });
        this.configNames = Array.from(names);
      })
      .finally(() => (this.loading = false));

    // Retrieve General Configurations
    this.NetworkConfigurationService.get().then(config => {
      this.networkConfig = config;
    });

    //Can you explain this?
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

  clearParams() {
    this.params.projects = [];
    this.individualProject = [];
    this.configGroups = [];
    this.projectsChosen = this.params.projects.length > 0;
  }

  // TODO: update autocomplete
  chipChanged(chip, removal) {
    // this.showFilters = false;
    this.params.expeditions = [];
    this.groupAdded = typeof chip === 'string' ? true : false;

    // If all chosen projects share the same configuration, retrieve specific config
    this.sharedConfigs = new Set();
    // check for uniqueness
    this.params.projects.forEach(p =>
      this.sharedConfigs.add(p.projectConfiguration.id),
    );
    const sharedConfigs = [...this.sharedConfigs];
    if (this.params.projects.length === 1 || sharedConfigs.length === 1) {
      this.ProjectConfigurationService.get(sharedConfigs[0]).then(
        ({ config }) => {
          return (this.config = config);
        },
      );
      // if single project selected retrieve expeditions
      if (this.params.projects.length === 1)
        this.ExpeditionService.all(this.params.projects[0].projectId).then(
          ({ data }) => (this.expeditions = data),
        );
    } else {
      this.config = this.networkConfig;
      this.expeditions = false;
    }

    // update parameters on add and remove chips
    if (!removal && this.groupAdded) {
      this.projects.forEach(p => {
        if (p.projectConfiguration.name === chip) this.params.projects.push(p);
      });
    } else if (!removal && !this.groupAdded) {
      this.projects.forEach(p => {
        if (p.projectId === chip.projectId) this.params.projects.push(p);
      });
    } else if (removal && this.groupAdded) {
      this.projects.forEach(p => {
        if (p.projectConfiguration.name === chip)
          var index = this.params.projects.indexOf(p);
        this.params.projects.splice(index, 1);
      });
    } else if (removal && !this.groupAdded) {
      this.projects.forEach(p => {
        if (p.projectId === chip.projectId)
          var index = this.params.projects.indexOf(p);
        this.params.projects.splice(index, 1);
      });
    }
    this.projectsChosen = this.params.projects.length > 0;
  }

  addFilter() {
    this.generateFilterOptions();

    const list = this.config.getList('markers');

    this.markers = list ? list.fields : [];
    this.hasFastqEntity = this.config.entities.some(e => e.type === 'Fastq');

    /*	  
    if (this.resetExpeditions) {
      console.log('resetting');
      this.params.expeditions = [];
    } else {
      this.resetExpeditions = true;
    } 

*/
    const filter = Object.assign({}, defaultFilter, {
      column: this.filterOptions[0].column,
      type: this.getQueryTypes(this.filterOptions[0].column)[0],
    });
    //    this.params.filters.push(filter);
    this.params.events.push(filter);
  }

  queryJson() {
    this.toggleLoading({ val: true });

    const projectIds = [];
    this.params.projects.length > 0
      ? this.params.projects.forEach(p => projectIds.push(p.projectId))
      : undefined;

    const selectEntities = ['Sample', 'fastqMetadata'];

    this.QueryService.queryJson(
      this.params.buildQuery(projectIds, selectEntities, SOURCE.join()),
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

  generateFilterOptions() {
    this.filterOptions = this.config.entities.reduce(
      (accumulator, entity) =>
        accumulator.concat(
          entity.attributes.filter(a => !a.internal).map(a => ({
            group: a.group
              ? `${entity.conceptAlias} ${a.group}`
              : `${entity.conceptAlias} Default Group`,
            column: `${entity.conceptAlias}.${a.column}`,
            dataType: a.dataType,
            list: this.config.findListForColumn(entity, a.column),
          })),
        ),
      [],
    );
    this.filterOptionsGroups = this.filterOptions.reduce((accumulator, a) => {
      if (!accumulator.includes(a.group)) accumulator.push(a.group);
      return accumulator;
    }, []);
    this.filterOptions.forEach(o => {
      if (o.group.includes('Event')) this.events.push(o);
      if (o.group.includes('Sample')) this.specimens.push(o);
      if (o.group.includes('Tissue')) this.tissues.push(o);
    });
  }
}

export default {
  template,
  controller: QueryFormController,
  bindings: {
    params: '<',
    queryMap: '<',
    currentUser: '<',
    onProjectChange: '&',
    onNewResults: '&',
    toggleLoading: '&',
  },
};

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

  // TODO: return table view by default on advanced search
  $onInit() {
    this.showGroups = true;
    this.loading = true;
    this.resetExpeditions = true;
    this.params.projects = [];
    this.groupedProjects = [];
    this.individualProjects = [];
    this.params.events = [];
    this.params.specimens = [];
    this.params.tissues = [];
    this.events = [];
    this.specimens = [];
    this.tissues = [];

    // Retrieve Projects
    this.ProjectService.all(true)
      .then(({ data }) => {
        this.projects = data;
        const names = new Set();
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

    // Can you explain this?
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
    this.projectsChosen = false;
    this.individualProjects = []; // need to remove selected chips
    this.groupedProjects = []; // need to remove selected chips
  }

  // TODO: update autocomplete to remove selected chips
  chipChanged(chip, removal) {
    this.params.expeditions = [];
    this.groupChip = typeof chip === 'string';
    this.projectsChosen =
      this.individualProjects.length > 0 || this.groupedProjects.length > 0;
    this.singleProject = this.individualProjects.length === 1;

    // update parameters on add and remove chips
    if (!removal && this.groupChip) {
      this.projects.forEach(p => {
        if (p.projectConfiguration.name === chip) this.params.projects.push(p);
      });
    } else if (!removal && !this.groupChip) {
      this.projects.forEach(p => {
        if (p.projectId === chip.projectId) this.params.projects.push(p);
      });
    } else if (removal && this.groupChip) {
      this.projects.forEach(p => {
        const index = this.params.projects.indexOf(p);
        if (p.projectConfiguration.name === chip)
          this.params.projects.splice(index, 1);
      });
    } else if (removal && !this.groupChip) {
      this.projects.forEach(p => {
        const index = this.params.projects.indexOf(p);
        if (p.projectId === chip.projectId)
          this.params.projects.splice(index, 1);
      });
    }

    // TODO: this will not work if projects with shared config are added individually
    // If all selected projects share configuration, retrieve their specific configuration
    if (this.singleProject || this.groupedProjects.length === 1) {
      this.firstMatchingConfig = this.projects.find(
        p =>
          p.projectConfiguration.name ===
          (this.groupedProjects[0] ||
            this.individualProjects[0].projectConfiguration.name),
      );
      this.ProjectConfigurationService.get(
        this.firstMatchingConfig.projectConfiguration.id,
      ).then(({ config }) => {
        this.config = config;
      });
    } else this.config = this.networkConfig;

    // retrieve expeditions for single projects only
    if (this.singleProject) {
      this.ExpeditionService.all(this.individualProjects[0].projectId).then(
        ({ data }) => {
          this.expeditions = data;
        },
      );
    } else this.expeditions = undefined;
  }

  addFilter(filterType) {
    this.generateFilterOptions();

    const list = this.config.getList('markers');

    this.markers = list ? list.fields : [];
    this.hasFastqEntity = this.config.entities.some(e => e.type === 'Fastq');

    const filter = Object.assign({}, defaultFilter, {
      column: this.filterOptions[0].column,
      type: this.getQueryTypes(this.filterOptions[0].column)[0],
    });

    if (filterType === 'event') this.params.events.push(filter);
    if (filterType === 'specimen') this.params.specimens.push(filter);
    if (filterType === 'tissue') this.params.tissues.push(filter);
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
    this.filterOptions.forEach(o => {
      if (o.group.includes('Event')) this.events.push(o);
      if (o.group.includes('Sample')) this.specimens.push(o);
      if (o.group.includes('Tissue')) this.tissues.push(o);
    });
  }

  queryJson() {
    this.toggleLoading({ val: true });
    const projectIds = [];
    const selectEntities = ['Sample', 'fastqMetadata'];

    if (this.params.projects.length > 0) {
      this.params.projects.forEach(p => projectIds.push(p.projectId));
    }

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

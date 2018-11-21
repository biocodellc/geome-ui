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
    //  this.initialParams = Object.freeze(this.params); // TODO: check this out (config is the only one that needs to change, which can be done by unbinding config fromt he params object)
    this.showGroups = true;
    this.resetExpeditions = true;
    this.groupedProjects = [];
    this.individualProjects = [];
    this.events = [];
    this.specimens = [];
    this.tissues = [];
    this.params.events = [];
    this.params.specimens = [];
    this.params.tissues = [];

    // Retrieve Projects
    this.ProjectService.all(true)
      .then(({ data }) => {
        this.projects = data;
        const names = new Set();
        this.projects.forEach(p => {
          names.add(p.projectConfiguration.name);
        });
        this.configNames = [...names];
      })

    // Retrieve General Configurations
    this.NetworkConfigurationService.get().then(config => {
      this.networkConfig = config;
      this.config = config;
      this.phylums = this.networkConfig.getList('phylum').fields;
      this.countries = this.networkConfig.getList('country').fields;
      this.markers = this.networkConfig.getList('markers').fields;
      this.hasFastqEntity = this.config.entities.some(e => e.type === 'Fastq');
    });

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

  familyToggle(name, groupedProjects) {
    const nameIdx = groupedProjects.indexOf(name);
    if (nameIdx > -1) {
      groupedProjects.splice(nameIdx, 1);
      this.projects.forEach(p => {
        const projIdx = this.params.projects.indexOf(p);
        if (p.projectConfiguration.name === name)
          this.params.projects.splice(projIdx, 1);
      });
    } else {
      groupedProjects.push(name);
      this.projects.forEach(p => {
        if (p.projectConfiguration.name === name) {
          this.params.projects.push(p);
        }
      });
    }
    if (groupedProjects.length === 1) {
      this.specificConfigCall();
    } else this.config = this.networkConfig;
  }

  familySelected(name, groupedProjects) {
    return groupedProjects.indexOf(name) > -1;
  }

  individualToggle(chip, removal) {
    this.params.expeditions = [];
    this.singleProject = this.individualProjects.length === 1;

    // update parameters on add and remove chips
    if (!removal) {
      this.projects.forEach(p => {
        if (p.projectId === chip.projectId) this.params.projects.push(p);
      });
    } else if (removal) {
      this.projects.forEach(p => {
        const index = this.params.projects.indexOf(p);
        if (p.projectId === chip.projectId)
          this.params.projects.splice(index, 1);
      });
    }

    // TODO: this needs to work for multiple projects with shared config added individually
    if (this.singleProject) {
      this.specificConfigCall();
      // retrieve expeditions for single projects only
      this.ExpeditionService.all(this.individualProjects[0].projectId).then(
        ({ data }) => {
          this.expeditions = data;
        },
      );
    } else {
      this.expeditions = undefined;
      this.config = this.networkConfig;
    }
  }

  specificConfigCall() {
    var specificName;
    if (this.groupedProjects.length === 1) {
      specificName = this.groupedProjects[0];
    } else if (this.singleProject) {
      specificName = this.individualProjects[0].projectConfiguration.name;
    }
    var firstMatchingConfig = this.projects.find(
      p => p.projectConfiguration.name === specificName,
    );
    this.ProjectConfigurationService.get(
      firstMatchingConfig.projectConfiguration.id,
    ).then(({ config }) => {
      this.config = config;
    });
  }

  clearParams() {
    // reset params to default
    // this.params = this.initialParams;
    Object.keys(this.params).forEach(key => {
      if (Array.isArray(this.params[key])) {
        this.params[key] = [];
      } else if (typeof this.params[key] === 'boolean') {
        this.params[key] = false;
      } else if (typeof this.params[key] === 'string') {
        this.params[key] = null;
      }
    });
    this.expeditions = undefined;
    this.individualProjects = []; // need to remove selected chips
    this.groupedProjects = []; // need to remove selected chips
    // TODO: remove country, phylum, markers, and filter chips
  }

  addFilter(filterType) {
    // TODO: fix bug with adding filters. ex: eventID is added automatically, but none of the others are??
    this.generateFilterOptions();

    const filter = Object.assign({}, defaultFilter, {
      column: this.filterOptions[0].column,
      type: this.getQueryTypes(this.filterOptions[0].column)[0],
    });

    if (filterType === 'event') this.params.events.push(filter);
    if (filterType === 'specimen') this.params.specimens.push(filter);
    if (filterType === 'tissue') this.params.tissues.push(filter);
    this.params.filters = this.params.events.concat(
      this.params.specimens,
      this.params.tissues,
    );
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
    const entities = this.config.entities
      .filter(e => ['Sample', 'Tissue'].includes(e.conceptAlias))
      .map(e => e.conceptAlias);
    this.entitiesForDownload({ entities });
    const selectEntities = ['Sample', 'fastqMetadata'];
    this.QueryService.queryJson(
      this.params.buildQuery(selectEntities, SOURCE.join()),
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
    onNewResults: '&',
    toggleLoading: '&',
    entitiesForDownload: '&',
  },
};

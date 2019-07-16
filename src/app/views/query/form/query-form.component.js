/* eslint-disable no-underscore-dangle */
import angular from 'angular';

const template = require('./query-form.html');

const QUERY_ENTITIES = ['Event', 'Sample', 'Tissue', 'Fastq'];

const SELECT_ENTITIES = {
  Event: [],
  Sample: ['Event'],
  Tissue: ['Event', 'Sample'],
  fastqMetadata: ['Event', 'Sample', 'Tissue'],
};

const SOURCE = [
  'Event.eventID',
  'Sample.eventID',
  'Sample.materialSampleID',
  'Event.locality',
  'Event.country',
  'Event.yearCollected',
  'Event.decimalLatitude',
  'Event.decimalLongitude',
  'Sample.genus',
  'Sample.specificEpithet',
  'fastqMetadata.tissueID',
  'fastqMetadata.identifier',
  'fastqMetadata.bioSample',
  'fastqMetadata.libraryLayout',
  'fastqMetadata.librarySource',
  'fastqMetadata.librarySelection',
  'fastqMetadata.bcid',
  'Event.bcid',
  'Sample.bcid',
  'Sample.phylum',
  'Sample.scientificName',
  'Tissue.materialSampleID',
  'Tissue.tissueID',
  'Tissue.bcid',
  'Tissue.tissueType',
  'Tissue.tissuePlate',
  'Tissue.tissueWell',
  'expeditionCode',
];

const queryTypes = {
  list: ['=', 'has'],
  string: ['=', 'like', 'has'],
  float: ['=', '<', '<=', '>', '>=', 'has'],
  datetime: ['=', '<', '<=', '>', '>=', 'has'],
  date: ['=', '<', '<=', '>', '>=', 'has'],
  integer: ['=', '<', '<=', '>', '>=', 'has'],
};

const PROJECT_RE = new RegExp(/_projects_:\s*(\d+)|(\[[\s\d,]+])/);

class QueryFormController {
  constructor(
    $scope,
    $mdDialog,
    $mdPanel,
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
    this.$mdDialog = $mdDialog;
    this.$mdPanel = $mdPanel;
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
    this.resetExpeditions = true;
    this.moreSearchOptions = false;
    this.entity = 'Sample';
    this.queryEntities = QUERY_ENTITIES;
    this.families = [];
    this.individualProjects = [];
    this.eventFilters = [];
    this.sampleFilters = [];
    this.tissueFilters = [];

    // Retrieve Projects
    const projectsPromise = this.ProjectService.all(true).then(({ data }) => {
      this.projects = data;
      const names = new Set();
      this.projects.forEach(p => {
        names.add(p.projectConfiguration.name);
      });
      this.configNames = [...names];
    });

    // Retrieve General Configuration
    let configPromise = this.NetworkConfigurationService.get().then(config => {
      this.networkConfig = config;
      this.config = config;
      this.phylums = this.networkConfig.getList('phylum').fields;
      this.countries = this.networkConfig.getList('country').fields;
      this.markers = this.networkConfig.getList('markers').fields;
    });

    // Query Results from Url
    const { q } = this.$location.search();
    if (q) {
      this.params.queryString = q;
      const projectMatch = PROJECT_RE.exec(q);
      if (projectMatch && projectMatch[1]) {
        // only set up to handle single project queries
        configPromise = projectsPromise.then(() => {
          const projectId = parseInt(projectMatch[1], 10);
          const project = this.projects.find(p => p.projectId === projectId);
          if (project) {
            return this.ProjectConfigurationService.get(
              project.projectConfiguration.id,
            ).then(({ config }) => {
              this.config = config;
            });
          }
          return undefined;
        });
      }
      configPromise.then(() => this.queryJson());
    }

    this.paramCopy = angular.copy(this.params);
  }

  switchQueryMethod() {
    const panelGroup = this.$mdPanel._groups.query;
    if (panelGroup) {
      panelGroup.openPanels.forEach(p => p.close());
    }
    if (!_.isEqual(this.params, this.paramCopy)) {
      // uses underscore third party library method
      this.$mdDialog
        .show(
          this.$mdDialog
            .confirm()
            .title('Change Query Method')
            .textContent(
              'Switching between queries will erase your previous search data',
            )
            .ariaLabel('Query change dialog')
            .ok('OK')
            .cancel('Cancel'),
        )
        .then(() => {
          this.entity = 'Sample';
          this.clearPreviousResults();
          this.clearParams();
          this.clearBounds();
        })
        .catch(() => {});
    } else {
      this.clearPreviousResults();
    }
  }

  clearPreviousResults() {
    this.queryMap._clearMap();
    this.onNewResults();
    this.moreSearchOptions = !this.moreSearchOptions;
  }

  clearParams() {
    // reset params to default
    Object.keys(this.params).forEach(key => {
      if (Array.isArray(this.params[key])) {
        this.params[key] = [];
      } else if (typeof this.params[key] === 'boolean') {
        this.params[key] = false;
      } else if (typeof this.params[key] === 'string') {
        this.params[key] = null;
      } else if (typeof this.params[key] === 'object') {
        this.params[key] = null;
      }
    });
    this.expeditions = undefined;
    this.individualProjects = [];
    this.families = [];
    this.removeFilterChips();
  }

  removeFilterChips() {
    this.params.filters = [];
    this.tissueFilters = [];
    this.eventFilters = [];
    this.sampleFilters = [];
  }

  familyToggle(chip, removal) {
    this.removeFilterChips();
    if (!removal) {
      this.projects.forEach(p => {
        if (p.projectConfiguration.name === chip) {
          this.params.projects.push(p);
        }
      });
    } else {
      this.projects.forEach(p => {
        const projIdx = this.params.projects.indexOf(p);
        if (p.projectConfiguration.name === chip)
          this.params.projects.splice(projIdx, 1);
      });
    }
    if (this.families.length === 1) {
      this.identifySpecificConfig();
    } else this.config = this.networkConfig;
  }

  individualToggle(chip, removal) {
    this.removeFilterChips();
    this.params.expeditions = [];
    this.singleProject = this.individualProjects.length === 1;

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

    if (this.singleProject) {
      this.identifySpecificConfig();
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

  identifySpecificConfig() {
    const specificConfigName = this.singleProject
      ? this.individualProjects[0].projectConfiguration.name
      : this.families[0];
    this.matchingProjectForConfigurationRetrieval = this.projects.find(
      p => p.projectConfiguration.name === specificConfigName,
    );
    this.callConfigService();
  }

  callConfigService() {
    this.ProjectConfigurationService.get(
      this.matchingProjectForConfigurationRetrieval.projectConfiguration.id,
    ).then(({ config }) => {
      this.config = config;
    });
  }

  generateFilterOptions(conceptAlias) {
    if (!this.filterOptions) {
      this.filterOptions = {};
      this.config.entities.forEach(e => {
        const alias = e.conceptAlias;
        const opts = e.attributes
          .filter(a => !a.internal)
          .map(a => ({
            column: `${alias}.${a.column}`,
            dataType: a.dataType,
            list: this.config.findListForColumn(e, a.column),
          }));
        this.filterOptions[alias] = opts;
        this.filterOptions[alias].sort((a, b) =>
          a.column > b.column ? 1 : b.column > a.column ? -1 : 0,
        );
      });
    }
    this.createArrayOfAttributesWithLists();

    const filter = { type: '=' };
    if (conceptAlias === 'Event') {
      filter.column = 'Event.eventID';
      this.eventFilters.push(filter);
    } else if (conceptAlias === 'Sample') {
      filter.column = 'Sample.materialSampleID';
      this.sampleFilters.push(filter);
    } else if (conceptAlias === 'Tissue') {
      filter.column = 'Tissue.tissueID';
      this.tissueFilters.push(filter);
    }
    this.filterToggle(filter);
  }

  createArrayOfAttributesWithLists() {
    this.controlledVocabAttributes = [];
    this.config.entities.forEach(e => {
      const allAliases = e.conceptAlias;
      this.filterOptions[allAliases].forEach(o => {
        if (o.list) {
          this.controlledVocabAttributes.push(o.column);
        }
      });
    });
  }

  filterToggle(chip, removal) {
    if (!removal) {
      this.params.filters.push(chip);
    } else if (removal) {
      const index = this.params.filters.indexOf(chip);
      this.params.filters.splice(index, 1);
    }
  }

  getQueryTypes(conceptAlias, column) {
    const opt = this.filterOptions[conceptAlias].find(o => o.column === column);
    if (opt) {
      if (opt.list) {
        return queryTypes.list;
      }
      return queryTypes[opt.dataType.toLowerCase()];
    }
    return [];
  }

  getList(conceptAlias, column) {
    const opt = this.filterOptions[conceptAlias].find(o => o.column === column);
    return opt.list ? opt.list.fields : [];
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

  queryJson() {
    const entity = this.entity === 'Fastq' ? 'fastqMetadata' : this.entity;
    this.toggleLoading({ val: true });
    const entities = this.config.entities
      .filter(e =>
        ['Event', 'Sample', 'Tissue', 'Sample_Photo', 'Event_Photo'].includes(
          e.conceptAlias,
        ),
      )
      .map(e => e.conceptAlias);
    this.entitiesForDownload({ entities });
    const selectEntities = SELECT_ENTITIES[entity];
    this.QueryService.queryJson(
      this.params.buildQuery(selectEntities, SOURCE.join()),
      entity,
      0,
      10000,
    )
      .then(results => {
        this.onNewResults({
          results,
          entity,
          isAdvancedSearch: this.moreSearchOptions,
        });
        this.queryMap.clearBounds();
        this.queryMap.setMarkers(results.data, entity);
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
    clearTableData: '&',
    toggleLoading: '&',
    entitiesForDownload: '&',
  },
};

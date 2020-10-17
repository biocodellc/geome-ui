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

const PROJECT_RE = new RegExp(/_projects_:\s*(\d+)|(\[[\s\d,]+])/);

class QueryFormController {
  constructor(
    $mdDialog,
    $mdPanel,
    $timeout,
    $location,
    QueryService,
    NetworkConfigurationService,
    ProjectConfigurationService,
    ExpeditionService,
    $stateParams,
  ) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.$mdPanel = $mdPanel;
    this.$timeout = $timeout;
    this.$location = $location;
    this.QueryService = QueryService;
    this.NetworkConfigurationService = NetworkConfigurationService;
    this.ProjectConfigurationService = ProjectConfigurationService;
    this.ExpeditionService = ExpeditionService;
    this.$stateParams = $stateParams;
  }

  $onInit() {
    this.resetExpeditions = true;
    this.moreSearchOptions = false;
    this.entity = this.$stateParams.entity || 'Sample';
    this.queryEntities = QUERY_ENTITIES;
    this.teams = [];
    this.individualProjects = [];
    this.eventFilters = [];
    this.sampleFilters = [];
    this.tissueFilters = [];
    this.samplePhotoFilters = [];
    this.eventPhotoFilters = [];
    this.paramCopy = angular.copy(this.params);
    this.projects = this.projects.data;
    const names = new Set();
    this.projects.forEach(p => {
      if (p.projectConfiguration.networkApproved === true) {
        names.add(p.projectConfiguration.name);
        if (
          this.teamId &&
          !this.teamHasBeenSelected &&
          p.projectConfiguration.id === this.teamId
        ) {
          this.teamHasBeenSelected = p;
          this.moreSearchOptions = true;
          this.teams.push(p.projectConfiguration.name);
        }
      }
    });
    this.configNames = [...names];

    // General Configuration Retrieval
    let configPromise = this.NetworkConfigurationService.get().then(config => {
      this.networkConfig = config;
      this.phylums = this.networkConfig.getList('phylum').fields;
      this.countries = this.networkConfig.getList('country').fields;
      this.markers = this.networkConfig.getList('markers').fields;
      this.setNetworkConfig();
    });

    // Query Results from Url
    const { q } = this.$location.search();
    if (q) {
      this.params.queryString = q;
      const projectMatch = PROJECT_RE.exec(q);
      if (projectMatch && projectMatch[1]) {
        // only set up to handle single project queries
        const projectId = parseInt(projectMatch[1], 10);
        const project = this.projects.find(p => p.projectId === projectId);
        if (project) {
          configPromise = this.ProjectConfigurationService.get(
            project.projectConfiguration.id,
          ).then(({ config }) => {
            this.config = config;
          });
        }
      }
      configPromise.then(() => this.queryJson());
    }
  }

  setNetworkConfig() {
    this.config = this.networkConfig;
    this.identifySpecificEntities();
  }

  identifySpecificEntities() {
    this.entitiesList = this.config.entities.map(e => e.conceptAlias);
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
          this.clearPreviousMapResults();
          this.setNetworkConfig();
          this.clearParams();
          this.clearBounds();
        })
        .catch(() => {});
    } else {
      this.clearPreviousMapResults();
    }
  }

  clearPreviousMapResults() {
    this.queryMap._clearMap();
    this.onNewResults();
    this.moreSearchOptions = !this.moreSearchOptions;
  }

  clearParams() {
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
    this.clearIndividualProjects();
    this.clearTeams();
    this.removeFilterChips();
  }

  clearTeams() {
    this.teams = [];
    this.params.projects = [];
  }

  clearIndividualProjects() {
    this.individualProjects = [];
    this.params.projects = [];
    this.expeditions = undefined;
  }

  removeFilterChips() {
    this.params.filters = [];
    this.tissueFilters = [];
    this.eventFilters = [];
    this.sampleFilters = [];
    this.samplePhotoFilters = [];
    this.eventPhotoFilters = [];
  }

  teamToggle(chip, removal) {
    this.removeFilterChips();
    if (this.individualProjects.length > 0) {
      this.clearIndividualProjects();
    }
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
    if (this.teams.length === 1) {
      this.identifySpecificConfig();
    } else this.setNetworkConfig();
  }

  individualToggle(chip, removal) {
    this.removeFilterChips();
    if (this.teams.length > 0) {
      this.clearTeams();
    }
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
      this.getExpeditions();
      this.identifySpecificConfig();
    } else {
      this.expeditions = undefined;
      this.setNetworkConfig();
    }
  }

  getExpeditions() {
    this.loadingExpeditions = true;
    this.ExpeditionService.all(this.individualProjects[0].projectId)
      .then(({ data }) => {
        this.expeditions = data;
      })
      .finally(() => {
        this.loadingExpeditions = false;
      });
  }

  identifySpecificConfig() {
    const specificConfigName =
      this.singleProject && this.teams.length <= 0
        ? this.individualProjects[0].projectConfiguration.name
        : this.teams[0];
    const matchingProjectForConfigurationRetrieval = this.projects.find(
      p => p.projectConfiguration.name === specificConfigName,
    );
    this.callConfigService(matchingProjectForConfigurationRetrieval);
  }

  callConfigService(projectMatch) {
    this.ProjectConfigurationService.get(
      projectMatch.projectConfiguration.id,
    ).then(({ config }) => {
      this.config = config;
      this.identifySpecificEntities();
    });
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
        [
          'Event',
          'Sample',
          'Tissue',
          'Sample_Photo',
          'Event_Photo',
          'Diagnostics',
        ].includes(e.conceptAlias),
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
    projects: '<',
    teamId: '<',
    onNewResults: '&',
    toggleLoading: '&',
    entitiesForDownload: '&',
  },
};

/* eslint-disable no-underscore-dangle */
import angular from 'angular';

const template = require('./team-query.html');

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

class TeamFormController {
  constructor($timeout, QueryService, ProjectConfigurationService) {
    'ngInject';

    this.$timeout = $timeout;
    this.QueryService = QueryService;
    this.ProjectConfigurationService = ProjectConfigurationService;
  }

  $onInit() {
    this.loading = true;
    this.params.projects = this.projects.data.filter(
      p => p.projectConfiguration.id === this.teamId,
    );
    this.ProjectConfigurationService.get(this.teamId)
      .then(data => {
        this.configuration = data;
        this.prepareEntitiesForDownload(data);
      })
      .finally(() => {
        this.loading = false;
      });
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
  }

  // TODO: Make the "active" class of drawBounds a lot more noticeable, so that
  // the user can tell theyre able to do somethign witht he mouse on the map
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

  prepareEntitiesForDownload(configuration) {
    const entities = configuration.config.entities
      .filter(e =>
        ['Event', 'Sample', 'Tissue', 'Sample_Photo', 'Event_Photo'].includes(
          e.conceptAlias,
        ),
      )
      .map(e => e.conceptAlias);
    this.entitiesForDownload({ entities });
  }

  queryJson() {
    const entity = 'Sample';
    const selectEntities = ['Event'];
    this.toggleLoading({ val: true });
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
  controller: TeamFormController,
  bindings: {
    params: '<',
    queryMap: '<',
    teamId: '<',
    projects: '<',
    onNewResults: '&',
    toggleLoading: '&',
    entitiesForDownload: '&',
  },
};

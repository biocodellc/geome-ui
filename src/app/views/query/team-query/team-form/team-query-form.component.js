/* eslint-disable no-underscore-dangle */
import angular from 'angular';

const template = require('./team-query-form.html');

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
  'Event.bcid',
  'Sample.bcid',
  'Sample.phylum',
  'Sample.scientificName',
  'Diagnostics.diseaseDetected',
  'Diagnostics.materialSampleID',
  'Diagnostics.bcid',
  'expeditionCode',
];

class TeamQueryFormController {
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

  // TODO: Do we want to add the ability to download
  // diagnostics data?
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
    const entity = 'Diagnostics';
    const selectEntities = ['Event', 'Sample'];
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
  controller: TeamQueryFormController,
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

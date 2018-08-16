import angular from 'angular';

import QueryMap from './QueryMap';
import QueryParams from './QueryParams';

const template = require('./query.html');

const POLICY_STORAGE_KEY = 'informedOfDataPolicy';

class QueryController {
  constructor(
    $state,
    $timeout,
    $window,
    QueryService,
    ExpeditionService,
    ProjectService,
    StorageService,
  ) {
    'ngInject';

    this.$state = $state;
    this.$timeout = $timeout;
    this.$window = $window;
    this.QueryService = QueryService;
    this.ExpeditionService = ExpeditionService;
    this.ProjectService = ProjectService;
    this.StorageService = StorageService;
  }

  $onInit() {
    this.params = new QueryParams();
    this.queryMap = new QueryMap(
      this.$state,
      'event.decimalLatitude',
      'event.decimalLongitude',
    );

    if (this.currentProject) {
      this.handleProjectChange(this.currentProject);
    }

    const informed = this.StorageService.get(POLICY_STORAGE_KEY);
    if (!informed) {
      angular.toaster(
        'Data is subject to our data usage policy',
        {
          name: 'View',
          fn: () => {
            const newWin = this.$window.open(
              'http://diversityindopacific.net/data-usage-agreement/',
              '_blank',
            );

            if (
              !newWin ||
              newWin.closed ||
              typeof newWin.closed === 'undefined'
            ) {
              angular.toaster('It appears you have a popup blocker enabled');
            }
          },
        },
        { hideDelay: 7000 },
      );
      this.StorageService.set(POLICY_STORAGE_KEY, true);
    }

    this.showSidebar = true;
    this.showMap = true;
    this.loading = false;
    this.hasFastqData = false;
    this.sidebarToggleToolTip = 'hide sidebar';
  }

  handleNewResults(results) {
    this.results = results;
    this.hasFastqData =
      results &&
      results.data.fastqMetadata &&
      results.data.fastqMetadata.length > 0;
  }

  downloadExcel() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadExcel(
      this.params.buildQuery(projectId, this.selectEntities()),
      'Event',
    ).finally(() => (this.loading = false));
  }

  downloadCsv() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadCsv(
      this.params.buildQuery(projectId, this.selectEntities()),
      'Event',
    ).finally(() => (this.loading = false));
  }

  downloadKml() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadKml(
      this.params.buildQuery(projectId, this.selectEntities()),
      'Event',
    ).finally(() => (this.loading = false));
  }

  downloadFasta() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadFasta(
      this.params.buildQuery(
        projectId,
        this.selectEntities(false).concat(['Event']),
      ),
      'fastaSequence',
    ).finally(() => (this.loading = false));
  }

  downloadFastq() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadFastq(
      this.params.buildQuery(
        projectId,
        this.selectEntities().concat(['Event']),
      ),
      'fastqMetadata',
    ).finally(() => (this.loading = false));
  }

  selectEntities(includeFastq = true) {
    return this.currentProject.config.entities
      .filter(
        e =>
          (includeFastq && e.type === 'Fastq') ||
          ['Sample', 'Tissue'].includes(e.conceptAlias),
      )
      .map(e => e.conceptAlias);
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    this.sidebarToggleToolTip = this.showSidebar
      ? 'hide sidebar'
      : 'show sidebar';

    this.resizeMap();
  }

  toggleMap(show) {
    if (this.showMap !== show) this.resizeMap();
    this.showMap = show;
  }

  resizeMap() {
    this.$timeout(() => this.queryMap.refreshSize(), 500);
  }

  handleProjectChange(project) {
    if (!project.config) {
      this.toggleLoading(true);
      this.ProjectService.get(project.projectId).then(p => {
        this.currentProject = p;
        this.toggleLoading(false);
      });
    } else {
      this.currentProject = project;
    }
    this.ExpeditionService.all(project.projectId).then(expeditions => {
      this.expeditions = expeditions.data;
    });
  }

  toggleLoading(val) {
    this.loading = val;
  }
}

export default {
  template,
  controller: QueryController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
    layout: '@',
    layoutFill: '@',
  },
};

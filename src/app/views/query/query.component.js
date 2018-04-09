import QueryMap from './QueryMap';
import QueryParams from './QueryParams';

const template = require('./query.html');

class QueryController {
  constructor(
    $state,
    $timeout,
    QueryService,
    ExpeditionService,
    ProjectService,
  ) {
    'ngInject';

    this.$state = $state;
    this.$timeout = $timeout;
    this.QueryService = QueryService;
    this.ExpeditionService = ExpeditionService;
    this.ProjectService = ProjectService;
  }

  $onInit() {
    this.params = new QueryParams();
    this.queryMap = new QueryMap(
      this.$state,
      'decimalLatitude',
      'decimalLongitude',
    );

    this.showSidebar = true;
    this.showMap = true;
    this.loading = false;
    this.sidebarToggleToolTip = 'hide sidebar';
  }

  handleNewResults(results) {
    this.results = results;
  }

  downloadExcel() {
    this.QueryService.downloadExcel(
      this.queryParams.build(),
      this.currentProject.config.entities[0].conceptAlias,
    );
  }

  downloadCsv() {
    this.QueryService.downloadCsv(
      this.queryParams.build(),
      this.currentProject.config.entities[0].conceptAlias,
    );
  }

  downloadKml() {
    this.QueryService.downloadKml(
      this.queryParams.build(),
      this.currentProject.config.entities[0].conceptAlias,
    );
  }

  downloadFasta() {
    this.QueryService.downloadFasta(this.queryParams.build(), 'fastaSequence');
  }

  downloadFastq() {
    this.QueryService.downloadFastq(this.queryParams.build(), 'fastqMetadata');
  }

  hasFastqData() {
    return this.results && this.results.data.some(d => d.fastqMetadata);
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
    layout: '@',
    layoutFill: '@',
  },
};

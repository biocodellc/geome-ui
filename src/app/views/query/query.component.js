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
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadExcel(
      this.params.buildQuery(projectId),
      this.currentProject.config.entities[0].conceptAlias,
    ).finally(() => (this.loading = false));
  }

  downloadCsv() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadCsv(
      this.params.buildQuery(projectId),
      this.currentProject.config.entities[0].conceptAlias,
    ).finally(() => (this.loading = false));
  }

  downloadKml() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadKml(
      this.params.buildQuery(projectId),
      this.currentProject.config.entities[0].conceptAlias,
    ).finally(() => (this.loading = false));
  }

  downloadFasta() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadFasta(
      this.params.buildQuery(projectId),
      'fastaSequence',
    ).finally(() => (this.loading = false));
  }

  downloadFastq() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadFastq(
      this.params.buildQuery(projectId),
      'fastqMetadata',
    ).finally(() => (this.loading = false));
  }

  // TODO: have query results return this as well. requires updating PostgresRecordRepository in backend
  // to support sql pagination & sorting
  hasFastqData() {
    return true;
    // return this.results && this.results.data.some(d => d.fastqMetadata);
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

import QueryMap from './QueryMap';
import QueryParams from './QueryParams';

const template = require('./query.html');

class QueryController {
  constructor(
    $state,
    $timeout,
    $location,
    QueryService,
    ExpeditionService,
    ProjectService,
    StorageService,
  ) {
    'ngInject';

    this.$state = $state;
    this.$timeout = $timeout;
    this.$location = $location;
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
      this.params.buildQuery(projectId, this.selectEntities()),
      'Event',
    ).finally(() => {
      this.loading = false;
    });
  }

  downloadCsv() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadCsv(
      this.params.buildQuery(projectId, this.selectEntities()),
      'Event',
    ).finally(() => {
      this.loading = false;
    });
  }

  downloadFasta() {
    this.loading = true;
    const { projectId } = this.currentProject;
    this.QueryService.downloadFasta(
      this.params.buildQuery(
        projectId,
        this.selectEntities().concat(['Event']),
      ),
      'fastaSequence',
    ).finally(() => {
      this.loading = false;
    });
  }

  selectEntities() {
    return this.currentProject.config.entities
      .filter(e => ['Sample', 'Tissue'].includes(e.conceptAlias))
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

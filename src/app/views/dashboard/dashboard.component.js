import QueryParams from '../query/QueryParams';

const template = require('./dashboard.html');

class DashboardController {
  constructor(ExpeditionService, DataService, QueryService) {
    'ngInject';

    this.ExpeditionService = ExpeditionService;
    this.DataService = DataService;
    this.QueryService = QueryService;
  }

  $onInit() {
    this.loading = true;
    this.totalItems = null;
    this.itemsPerPage = 100;
    this.currentPage = 1;
    this.results = [];
    this.displayResults = [];
  }

  $onChanges(changesObj) {
    if (
      this.currentProject &&
      'currentProject' in changesObj &&
      changesObj.currentProject.previousValue !== this.currentProject
    ) {
      this.fetchPage();
    }
  }

  downloadCsv(expeditionCode) {
    this.loadingExpedition = expeditionCode;
    this.QueryService.downloadCsv(
      this.getQuery(expeditionCode),
      'Resource',
    ).finally(() => (this.loadingExpedition = undefined));
  }

  downloadFasta(expeditionCode) {
    this.loadingExpedition = expeditionCode;
    this.QueryService.downloadFasta(
      this.getQuery(expeditionCode),
      'fastaSequence',
    ).finally(() => (this.loadingExpedition = undefined));
  }

  getQuery(expeditionCode) {
    const params = new QueryParams();
    params.expeditions.push({ expeditionCode });
    return params.buildQuery(this.currentProject.projectId);
  }

  downloadFastq(expeditionCode) {
    this.loadingExpedition = expeditionCode;
    this.DataService.generateSraData(
      this.currentProject.projectId,
      expeditionCode,
    ).finally(() => (this.loadingExpedition = undefined));
  }

  pageChanged() {
    this.displayResults = this.results.slice(
      (this.currentPage - 1) * this.itemsPerPage,
      this.currentPage * this.itemsPerPage,
    );
  }

  fetchPage() {
    this.ExpeditionService.stats(this.currentProject.projectId)
      .then(({ data }) => {
        Object.assign(this.results, data);
        this.pageChanged();
        this.totalItems = this.results.length;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}

export default {
  template,
  controller: DashboardController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};

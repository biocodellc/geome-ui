import angular from 'angular';


//TODO split a service out of this class
const DEFAULT_FILTER = {
  column: null,
  value: null,
};

export default class QueryController {

  constructor($scope, $http, LoadingModal, FailModalFactory, ProjectService, ExpeditionService, AuthService, FileService, REST_ROOT) {
    'ngInject';

    this.error = null;
    this.moreSearchOptions = false;
    this.filterOptions = [];
    this.filters = [];
    this.queryString = null;
    this.expeditions = [];
    this.project = ProjectService.currentProject();
    this.selectedExpeditions = [];
    this.queryResults = null;
    this.queryInfo = {
      size: 0,
      totalElements: 0,
    };
    this.currentPage = 1;

    this.$http = $http;
    this.LoadingModal = LoadingModal;
    this.FailModalFactory = FailModalFactory;
    this.ExpeditionService = ExpeditionService;
    this.AuthService = AuthService;
    this.FileService = FileService;
    this.REST_ROOT = REST_ROOT;

    $scope.$watch("queryVm.project", (newVal, oldVal) => {
      if (newVal && newVal !== oldVal) {
        this.getExpeditions();
        this.getFilterOptions();
      }
    });

    $scope.$watchCollection("queryVm.selectedExpeditions", (newVal, oldVal) => {
      if (newVal && newVal != oldVal) {
        this.updateQueryString();
      }
    });

    $scope.$watch("$ctrl.filters", (newVal, oldVal) => {
      if (newVal && newVal != oldVal) {
        this.updateQueryString();
      }
    }, true);

  }

  search() {
    this.currentPage = 1;
    this.queryJson();
  }

  queryJson() {
    this.LoadingModal.open();
    var data = {
      projectId: this.project.projectId,
      query: (this.queryString.trim().length > 0)
        ? this.queryString
        : "*",
    };

    this.$http.post(REST_ROOT + "projects/query/json/?limit=50&page=" + (
      this.currentPage - 1), data).then((response) => {
      this.queryResults = this._transformData(response.data);
    }, (response) => {
      if (response.status = -1 && !response.data) {
        this.error = "Timed out waiting for response! Try again later. If the problem persists, contact the System Administrator.";
      } else {
        this.error = response.data.error || response.data.usrMessage || "Server Error!";
      }
      this.queryResults = null;
    }).finally(() => this.LoadingModal.close());
  }

  addFilter() {
    const filter = Object.assign({}, DEFAULT_FILTER);
    filter.column = this.filterOptions[ 0 ];
    this.filters.push(filter);
  }

  removeFilter(index) {
    this.filters.splice(index, 1);
  }

  downloadExcel() {
    var data = {
      projectId: this.project.projectId,
      query: (this.queryString.trim().length > 0)
        ? this.queryString
        : "*",
    };

    this.$http.post(this.REST_ROOT + "projects/query/excel", data).then((response) => {
      if (response.status === 204) {
        angular.alerts.info("No resources found for query");
        return;
      }

      return this.FileService.download(response.data.url);

    }, angular.catcher("Failed to download query results as excel file"))
  }

  downloadKml() {
    var data = {
      projectId: this.project.projectId,
      query: (this.queryString.trim().length > 0)
        ? this.queryString
        : "*",
    };

    this.$http.post(this.REST_ROOT + "projects/query/kml", data).then((response) => {
      if (response.status === 204) {
        angular.alerts.info("No resources found for query");
        return;
      }

      return this.FileService.download(response.data.url);

    }, angular.catcher("Failed to download query results as kml file"));
  }

  downloadCsv() {
    var data = {
      projectId: this.project.projectId,
      query: (this.queryString.trim().length > 0)
        ? this.queryString
        : "*",
    };

    this.$http.post(this.REST_ROOT + "projects/query/csv", data).then((response) => {
      if (response.status === 204) {
        angular.alerts.info("No resources found for query");
        return;
      }

      return this.FileService.download(response.data.url);

    }, angular.catcher("Failed to download query results as csv file"));
  }

  getExpeditions() {
    this.ExpeditionService.all(this.project.projectId).then((response) => {
        this.selectedExpeditions = [];
        this.expeditions = [];
        response.data.forEach(expedition => this.expeditions.push(expedition.expeditionCode));
      },
      () => {
        this.error = "Failed to load Expeditions.";
      });
  }

  getFilterOptions() {
    this.$http.get(this.REST_ROOT + "projects/" + this.project.projectId + "/filterOptions").then((response) => {
      Object.assign(this.filterOptions, response.data);

      if (this.filters.length === 0) {
        this.addFilter();
      }
    }, (response) => {
      this.error = response.data.error || response.data.usrMessage || "Failed to fetch filter options";
    })
  }

  _transformData(data) {
    var transformedData = {
      keys: [],
      data: [],
    };
    if (data) {
      this.queryInfo.size = data.size;
      this.queryInfo.totalElements = data.totalElements;

      if (data.content.length > 0) {
        transformedData.keys = Object.keys(data.content[ 0 ]);

        data.content.forEach((resource) => {
          const resourceData = transformedData.keys.map(key => resource[ key ]);
          transformedData.data.push(resourceData);
        });
      }
    } else {
      this.queryInfo.totalElements = 0;
    }
    return transformedData;
  }

  updateQueryString() {
    var q = "";

    if (this.selectedExpeditions.length > 0) {
      q += "_expeditions_:[" + this.selectedExpeditions.join(", ") + "]";
    }

    this.filters.forEach((filter) => {
      if (filter.value) {
        if (q.trim().length > 0) {
          q += " AND ";
        }

        q += filter.column + " = \"" + filter.value + "\"";
      }
    });

    this.queryString = q;
  }
}

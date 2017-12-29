import angular from 'angular';
import files from './files.service';

class DataService {
  constructor($http, FileService, alerts, REST_ROOT) {
    'ngInject';
    this.$http = $http;
    this.FileService = FileService;
    this.alerts = alerts;
    this.REST_ROOT = REST_ROOT;
  }

  exportData(projectId, expeditionCode) {
    if (!projectId) {
      return Promise.reject({ data: { error: "No project is selected" } });
    }

    return this.$http.get(this.REST_ROOT + 'data/export/' + projectId + '/' + expeditionCode)
      .then((response) => {
        if (response.status === 204) {
          this.alerts.info("No resources found");
          return
        }
        return this.FileService.download(response.data.url)
      })
      .catch(angular.catcher("Failed to export data"));
  }
}

export default angular.module('fims.data', [ files ])
  .service('DataService', DataService)
  .name;

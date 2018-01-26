import angular from 'angular';
import fileService from './file.service';

class TemplateService {
  constructor($http, FileService, REST_ROOT) {
    'ngInject';

    this.$http = $http;
    this.FileService = FileService;
    this.REST_ROOT = REST_ROOT;
  }

  all(projectId) {
    return this.$http.get(`${this.REST_ROOT}projects/${projectId}/templates`);
  }

  generate(projectId, sheetName, columns) {
    return this.$http
      .post(`${this.REST_ROOT}projects/${projectId}/templates/generate`, {
        sheetName,
        columns,
      })
      .then(response => this.FileService.download(response.data.url))
      .catch(angular.catcher('Failed to generate template'));
  }
}

export default angular
  .module('fims.templateService', [fileService])
  .service('TemplateService', TemplateService).name;

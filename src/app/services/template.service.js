import angular from 'angular';

import fileService from './file.service';
import config from '../utils/config';

const { restRoot } = config;

class TemplateService {
  constructor($http, FileService) {
    'ngInject';

    this.$http = $http;
    this.FileService = FileService;
  }

  all(projectId) {
    return this.$http.get(`${restRoot}projects/${projectId}/templates`);
  }

  generate(projectId, worksheetTemplates) {
    return this.$http({
      method: 'POST',
      url: `${restRoot}projects/${projectId}/templates/generate`,
      data: worksheetTemplates,
      keepJson: true,
    })
      .then(response => this.FileService.download(response.data.url))
      .catch(angular.catcher('Failed to generate template'));
  }

  save(projectId, templateName, worksheet, columns) {
    return this.$http
      .post(`${restRoot}projects/${projectId}/templates/${templateName}`, {
        columns,
        worksheet,
      })
      .catch(angular.catcher('Failed to save template'));
  }

  delete(projectId, templateName) {
    return this.$http
      .delete(`${restRoot}projects/${projectId}/templates/${templateName}`)
      .catch(angular.catcher('Failed to delete template'));
  }
}

export default angular
  .module('fims.templateService', [fileService])
  .service('TemplateService', TemplateService).name;

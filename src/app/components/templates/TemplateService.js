class TemplateService {
  constructor($http, FileService, exception, REST_ROOT) {
    this.$http = $http;
    this.FileService = FileService;
    this.exception = exception;
    this.REST_ROOT = REST_ROOT;
  }

  all(projectId) {
    return this.$http.get(this.REST_ROOT + 'projects/' + projectId + '/templates')
  }

  generate(projectId, sheetName, columns) {
    return this.$http.post(this.REST_ROOT + 'projects/' + projectId + '/templates/generate', {
        sheetName: sheetName,
        columns: columns,
      })
      .then(response => this.FileService.download(response.data.url))
      .catch(this.exception.catcher("Failed to generate template"));
  }
}

TemplateService.$inject = [ '$http', 'FileService', 'exception', 'REST_ROOT' ];

export default TemplateService;

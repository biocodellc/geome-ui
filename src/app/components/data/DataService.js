class DataService {
  constructor($http, ProjectService, FileService, alerts, exception, REST_ROOT) {
    'ngInject';
    this.http = $http;
    this.projectService = ProjectService;
    this.fileService = FileService;
    this.alerts = alerts;
    this.exception = exception;
    this.REST_ROOT = REST_ROOT;
  }

  exportData(expeditionCode) {
    let projectId = this.projectService.currentProject.projectId;

    if (!projectId) {
      return Promise.reject({ data: { error: "No project is selected" } });
    }

    return this.http.get(this.REST_ROOT + 'data/export/' + projectId + '/' + expeditionCode)
      .then((response) => {
        if (response.status === 204) {
          this.alerts.info("No resources found");
          return
        }
        return this.fileService.download(response.data.url)
      })
      .catch(this.exception.catcher("Failed to export data"));
  }
}

export default DataService;

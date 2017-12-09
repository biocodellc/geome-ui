import ProjectConfig from "./ProjectConfig";

export default class ProjectConfigService {
  constructor($http, REST_ROOT, exception) {
    "ngInject";

    this.$http = $http;
    this.REST_ROOT = REST_ROOT;
    this.exception = exception;
  }


  get(projectId) {
    return this.$http.get(this.REST_ROOT + 'projects/' + projectId + '/config')
      .then(({ data }) => new ProjectConfig(data));
  }

  save(config, projectId) {
    return this.$http({
        method: 'PUT',
        url: this.REST_ROOT + 'projects/' + projectId + '/config',
        data: config,
        keepJson: true,
      })
      .then(({ data }) => new ProjectConfig(data))
      .catch((response) => {
        if (response.status !== 400 || !response.data.errors) {
          this.exception.catcher("Error updating config")(response);
        }
        throw new Error(response);
      });
  }
}

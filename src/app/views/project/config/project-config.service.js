import ProjectConfig from "../../../models/ProjectConfig";

export default class ProjectConfigService {
  constructor($http, REST_ROOT) {
    "ngInject";

    this.$http = $http;
    this.REST_ROOT = REST_ROOT;
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
          angular.catcher("Error updating config")(response);
        }
        throw new Error(response);
      });
  }
}

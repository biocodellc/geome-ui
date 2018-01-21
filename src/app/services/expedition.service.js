import angular from "angular";


class ExpeditionService {
  constructor($http, REST_ROOT) {
    'ngInject';

    this.$http = $http;
    this.REST_ROOT = REST_ROOT;
  }

  update(projectId, expedition) {
    if (!projectId) {
      return Promise.reject({ data: { error: "No project is selected" } });
    }

    return this.$http({
        method: 'PUT',
        url: this.REST_ROOT + 'projects/' + projectId + '/expeditions/' + expedition.expeditionCode,
        data: expedition,
        keepJson: true,
      })
      .catch(angular.catcher("Failed to update the expedition."));
  }

  deleteExpedition(projectId, expedition) {
    if (!projectId) {
      return Promise.reject({ data: { error: "No project is selected" } });
    }

    return this.$http.delete(this.REST_ROOT + 'projects/' + projectId + '/expeditions/' + expedition.expeditionCode)
      .catch(angular.catcher("Failed to delete the expedition."));
  }

  userExpeditions(projectId, includePrivate) {
    if (!projectId) {
      return Promise.reject({ data: { error: "No project is selected" } });
    }

    if (!includePrivate) {
      includePrivate = false;
    }
    return this.$http.get(this.REST_ROOT + 'projects/' + projectId + '/expeditions?user&includePrivate=' + includePrivate)
      .catch(angular.catcher("Failed to load your expeditions."));
  }

  all(projectId) {
    if (!projectId) {
      return Promise.reject({ data: { error: "No project is selected" } });
    }

    return this.$http.get(this.REST_ROOT + 'projects/' + projectId + '/expeditions')
      .catch(angular.catcher("Failed to load project expeditions."));
  }

  getExpedition(projectId, expeditionCode) {
    return this.$http.get(this.REST_ROOT + 'projects/' + projectId + '/expeditions/' + expeditionCode);
  }

  getExpeditionsForUser(projectId, includePrivate) {
    if (!includePrivate) {
      includePrivate = false;
    }
    return this.$http.get(this.REST_ROOT + 'projects/' + projectId + '/expeditions?user&includePrivate=' + includePrivate);
  }

  getExpeditionsForAdmin(projectId) {
    return this.$http.get(this.REST_ROOT + 'projects/' + projectId + '/expeditions?admin');
  }

  updateExpeditions(projectId, expeditions) {
    return this.$http({
      method: 'PUT',
      url: this.REST_ROOT + 'projects/' + projectId + "/expeditions",
      data: expeditions,
      keepJson: true,
    });
  }
}

export default angular.module('fims.expeditionService', [])
  .service('ExpeditionService', ExpeditionService)
  .name;
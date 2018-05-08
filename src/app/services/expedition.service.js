import angular from 'angular';

import config from '../utils/config';

const { restRoot } = config;

class ExpeditionService {
  constructor($http) {
    'ngInject';

    this.$http = $http;
  }

  create(projectId, expedition) {
    return this.$http({
      method: 'POST',
      url: `${restRoot}projects/${projectId}/expeditions/${
        expedition.expeditionCode
      }`,
      data: expedition,
      keepJson: true,
    }).catch(angular.catcher('Failed to create the expedition.'));
  }

  update(projectId, expedition) {
    if (!projectId) {
      return Promise.reject({ data: { error: 'No project is selected' } });
    }

    return this.$http({
      method: 'PUT',
      url: `${restRoot}projects/${projectId}/expeditions/${
        expedition.expeditionCode
      }`,
      data: expedition,
      keepJson: true,
    }).catch(angular.catcher('Failed to update the expedition.'));
  }

  deleteExpedition(projectId, expedition) {
    if (!projectId) {
      return Promise.reject({ data: { error: 'No project is selected' } });
    }

    return this.$http
      .delete(
        `${restRoot}projects/${projectId}/expeditions/${
          expedition.expeditionCode
        }`,
      )
      .catch(angular.catcher('Failed to delete the expedition.'));
  }

  userExpeditions(projectId, includePrivate) {
    if (!projectId) {
      return Promise.reject({ data: { error: 'No project is selected' } });
    }

    if (!includePrivate) {
      includePrivate = false;
    }
    return this.$http
      .get(
        `${restRoot}projects/${projectId}/expeditions?user&includePrivate=${includePrivate}`,
      )
      .catch(angular.catcher('Failed to load your expeditions.'));
  }

  all(projectId) {
    if (!projectId) {
      return Promise.reject({ data: { error: 'No project is selected' } });
    }

    return this.$http
      .get(`${restRoot}projects/${projectId}/expeditions`)
      .catch(angular.catcher('Failed to load project expeditions.'));
  }

  getExpedition(projectId, expeditionCode) {
    return this.$http.get(
      `${restRoot}projects/${projectId}/expeditions/${expeditionCode}`,
    );
  }

  stats(projectId) {
    if (!projectId) {
      return Promise.reject({ data: { error: 'No project is selected' } });
    }

    return this.$http
      .get(`${restRoot}projects/${projectId}/expeditions/stats`)
      .catch(angular.catcher('Failed to load expedition stats.'));
  }

  getExpeditionsForUser(projectId, includePrivate) {
    if (!includePrivate) {
      includePrivate = false;
    }
    return this.$http.get(
      `${restRoot}projects/${projectId}/expeditions?user&includePrivate=${includePrivate}`,
    );
  }

  getExpeditionsForAdmin(projectId) {
    return this.$http.get(`${restRoot}projects/${projectId}/expeditions?admin`);
  }

  updateExpeditions(projectId, expeditions) {
    return this.$http({
      method: 'PUT',
      url: `${restRoot}projects/${projectId}/expeditions`,
      data: expeditions,
      keepJson: true,
    });
  }
}

export default angular
  .module('fims.expeditionService', [])
  .service('ExpeditionService', ExpeditionService).name;

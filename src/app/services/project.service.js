import angular from 'angular';
import { EventEmitter } from 'events';

import storageService from './storage.service';
import projectConfigurationService from './projectConfiguration.service';
import config from '../utils/config';
import ProjectConfig from '../models/ProjectConfig';

const { restRoot } = config;

export const PROJECT_CHANGED_EVENT = 'projectChanged';

let currentProject;
class ProjectService extends EventEmitter {
  constructor(
    $cacheFactory,
    $http,
    $timeout,
    StorageService,
    ProjectConfigurationService,
    $state,
  ) {
    'ngInject';

    super();
    this.PROJECT_CACHE = $cacheFactory('projects');

    this.$http = $http;
    this.$timeout = $timeout;
    this.StorageService = StorageService;
    this.ProjectConfigurationService = ProjectConfigurationService;
    this.$state = $state;
  }

  /**
   * this should only be used in ui-router hooks
   */
  currentProject() {
    return currentProject;
  }

  setCurrentProject(project, ignoreReload = false, redirectIfNull = true) {
    if (!project) {
      currentProject = undefined;
      this.emit(PROJECT_CHANGED_EVENT, currentProject, ignoreReload);
      if (redirectIfNull) this.$state.go('dashboard');
      return Promise.resolve;
    }

    const setProjectConfig = () =>
      project.config ? Promise.resolve(project) : this.get(project.projectId);

    return setProjectConfig().then(p => {
      this.StorageService.set('projectId', project.projectId);
      currentProject = p;
      this.emit(PROJECT_CHANGED_EVENT, currentProject, ignoreReload);
      return p;
    });
  }

  cacheProject(projectId) {
    this.StorageService.set('projectId', projectId);
  }

  get(projectId, includeConfig = true) {
    if (!projectId) {
      return Promise.resolve();
    }

    return this.all(true)
      .then(({ data }) => data.find(p => p.projectId === projectId))
      .then(project => {
        if (!includeConfig) {
          return project;
        }
        if (!project) {
          return this.stats(true)
            .then(({ data }) => data.find(p => p.projectId === projectId))
            .then(discoverableProject => {
              if (discoverableProject) {
                Object.assign(discoverableProject, { limitedAccess: true });
              }
            });
        }

        return this.getConfig(project.projectId)
          .then(c => Object.assign({}, project, { config: c }))
          .catch(angular.catcher('Failed to load project configuration'));
      })
      .catch(response => angular.catcher('Failed to load project')(response));
  }

  getConfig(projectId) {
    if (!projectId) {
      return Promise.resolve();
    }
    return this.$http
      .get(`${restRoot}projects/${projectId}/config`)
      .then(({ data }) => new ProjectConfig(data))
      .catch(angular.catcher('Failed to load project configuration'));
  }

  all(includePublic) {
    return this.$http
      .get(`${restRoot}projects?includePublic=${includePublic}`, {
        cache: this.PROJECT_CACHE,
      })
      .catch(angular.catcher('Failed to load projects'));
  }

  find(includePublic, projectTitle) {
    return this.$http
      .get(
        `${restRoot}projects?includePublic=${includePublic}&projectTitle=${projectTitle}`,
        {
          cache: this.PROJECT_CACHE,
        },
      )
      .catch(angular.catcher('Failed to find projects by projectTitle'));
  }

  checkExists(projectTitle) {
    return this.$http
      .get(`${restRoot}projects/exists/${projectTitle}`)
      .catch(angular.catcher('Failed to check if projectTitle exists'));
  }

  stats(includePublic) {
    return this.$http
      .get(`${restRoot}projects/stats?includePublic=${includePublic}`)
      .catch(angular.catcher('Failed to load project statistics'));
  }

  create(project) {
    this.PROJECT_CACHE.removeAll();
    return this.$http({
      method: 'POST',
      url: `${restRoot}projects`,
      data: project,
      keepJson: true,
    }).catch(angular.catcher('Failed to create the project.'));
  }

  update(project) {
    this.PROJECT_CACHE.removeAll();
    return this.$http({
      method: 'PUT',
      url: `${restRoot}projects/${project.projectId}`,
      data: project,
      keepJson: true,
    }).catch(angular.catcher('Failed to update the project.'));
  }

  delete(project) {
    this.PROJECT_CACHE.removeAll();
    return this.$http({
      method: 'DELETE',
      url: `${restRoot}projects/${project.projectId}`,
    })
      .then(() => this.setCurrentProject())
      .catch(angular.catcher('Failed to delete the project.'));
  }

  loadFromSession(projectId) {
    if (!projectId) {
      projectId = this.StorageService.get('projectId');
    }

    return this.get(projectId);
  }
}

export default angular
  .module('fims.projectService', [storageService, projectConfigurationService])
  .service('ProjectService', ProjectService).name;

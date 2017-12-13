class ProjectService {
  constructor($rootScope, $cacheFactory, $http, $timeout, StorageService, exception, ProjectConfigService, REST_ROOT) {
    'ngInject';
    this.PROJECT_CACHE = $cacheFactory('project');

    this._loading = false;
    this.currentProject = undefined;

    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$timeout = $timeout;
    this.StorageService = StorageService;
    this.exception = exception;
    this.ProjectConfigService = ProjectConfigService;
    this.REST_ROOT = REST_ROOT;

    $rootScope.$on("$logoutEvent", () => {
      if (this.currentProject) {
        const { projectId } = this.currentProject;
        this.currentProject = undefined;
        // this will set the project only if it is a public project
        this.setFromId(projectId);
      }
    });
  }

  /**
   * Returns a Promise that is resolved when the project loads, or after 5s. If the project is loaded,
   * the promise will resolve immediately. The promise will be rejected if there is no project loaded.
   */
  waitForProject() {
    if (this._loading) {
      return new Promise((resolve, reject) => {
        this.$rootScope.$on('$projectChangeEvent', function (event, project) {
          resolve(project);
        });

        // set a timeout in-case the project takes too long to load
        this.$timeout(() => {
          if (this.currentProject) {
            resolve(this.currentProject);
          } else {
            reject();
          }
        }, 5000, false);
      });
    } else if (this.currentProject) {
      return Promise.resolve(this.currentProject);
    } else {
      return Promise.reject();
    }
  }

  set(project) {
    this._loading = true;
    this.ProjectConfigService.get(project.projectId)
      .then((config) => {
        this.currentProject.config = config;
        this.StorageService.set('projectId', this.currentProject.projectId);
        this.$rootScope.$broadcast('$projectChangeEvent', this.currentProject);
        this._loading = false;
      }, (response) => {
        this._loading = false;
        this.exception.catcher("Failed to load project configuration")(response);
      });

    this.currentProject = project;
  }

  setFromId(projectId) {
    this._loading = true;
    return this.all(true)
      .then((response) => {
        const project = response.data.find(p => p.projectId === projectId);

        if (project) {
          this.set(project)
        }
      })
      .finally(() => {
        this._loading = false;
      });
  }

  all(includePublic) {
    return this.$http.get(this.REST_ROOT + 'projects?includePublic=' + includePublic, { cache: this.PROJECT_CACHE })
      .catch(this.exception.catcher("Failed to load projects"));
  }

  update(project) {
    this.PROJECT_CACHE.removeAll();
    return this.$http({
        method: 'PUT',
        url: this.REST_ROOT + 'projects/' + project.projectId,
        data: project,
        keepJson: true,
      })
      .catch(this.exception.catcher("Failed to update the project."));

  }

  resolveProjectId() {
    return new Promise((resolve, reject) => {
      if (this.currentProject) {
        resolve(this.currentProject.projectId);
      } else {
        reject({ data: { error: "No project is selected" } });
      }
    });
  }

}

export default ProjectService;

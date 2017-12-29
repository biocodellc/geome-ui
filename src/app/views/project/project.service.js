class Projects {
  constructor($rootScope, $cacheFactory, $http, $timeout, StorageService, exception, ProjectConfigService, REST_ROOT) {
    'ngInject';
    this.PROJECT_CACHE = $cacheFactory('projects');

    this._loading = false;
    this._currentProject = undefined;

    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$timeout = $timeout;
    this.StorageService = StorageService;
    this.exception = exception;
    this.ProjectConfigService = ProjectConfigService;
    this.REST_ROOT = REST_ROOT;
  }

  currentProject() {
    if (this._currentProject) {
      return Object.assign({}, this._currentProject);
    }

    return undefined;
  }

  setCurrentProject(project) {
    if (!project) {
      this._currentProject = undefined;
      this.$rootScope.$broadcast('$projectChangeEvent', this.currentProject());
      return Promise.resolve(this._currentProject);
    }

    const setProjectConfig = () => {
      if (project.config) {
        return Promise.resolve();
      }

      this._loading = true;
      return this.ProjectConfigService.get(project.projectId)
        .then((config) => {
          project.config = config;
          this._loading = false;
        })
        .catch((response) => {
          this._loading = false;
          this.exception.catcher("Failed to load project configuration")(response);
        });
    };

    return setProjectConfig()
      .then(() => {
        this.StorageService.set('projectId', project.projectId);

        this._currentProject = project;

        //TODO remove this
        this.$rootScope.$broadcast('$projectChangeEvent', this.currentProject());

        return this._currentProject;
      })

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
          if (this._currentProject) {
            resolve(this.currentProject());
          } else {
            reject();
          }
        }, 5000, false);
      });
    } else if (this._currentProject) {
      return Promise.resolve(this.currentProject());
    } else {
      return Promise.reject();
    }
  }

  /**
   * @deprecated
   */
  set(project) {
    this.setCurrentProject(project);
  }

  setFromId(projectId) {
    this._loading = true;
    return this.all(true)
      .then(({ data }) => {
        const project = data.find(p => p.projectId === projectId);
        return this.setCurrentProject(project);
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
      if (this._currentProject) {
        resolve(this._currentProject.projectId);
      } else {
        reject({ data: { error: "No project is selected" } });
      }
    });
  }

}

export default Projects;
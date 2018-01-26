class ProjectFactory {
  constructor($http, $cacheFactory, UserService, REST_ROOT) {
    'ngInject';

    this.PROJECT_CACHE = $cacheFactory('projectOld');
    this.MEMBER_CACHE = $cacheFactory('project_members');

    this.$http = $http;
    this.UserService = UserService;
    this.REST_ROOT = REST_ROOT;
  }

  getProjects(includePublic) {
    return this.$http.get(
      `${this.REST_ROOT}projects?includePublic=${includePublic}`,
      { cache: this.PROJECT_CACHE },
    );
  }

  getProjectsForAdmin() {
    return this.$http.get(`${this.REST_ROOT}projects?admin`, {
      cache: this.PROJECT_CACHE,
    });
  }

  get(projectId) {
    return this.getProjects(true).then(response =>
      response.data.find(p => p.projectId === projectId),
    );
  }

  getConfig(projectId) {
    return this.$http.get(`${this.REST_ROOT}projects/${projectId}/config`);
  }

  updateProject(project) {
    this.PROJECT_CACHE.removeAll();
    return this.$http({
      method: 'POST',
      url: `${this.REST_ROOT}projects/${project.projectId}`,
      data: project,
      keepJson: true,
    });
  }

  getMembers(projectId) {
    return this.$http.get(`${this.REST_ROOT}projects/${projectId}/members`, {
      cache: this.MEMBER_CACHE,
    });
  }

  removeMember(projectId, username) {
    this.MEMBER_CACHE.removeAll();
    return this.$http.delete(
      `${this.REST_ROOT}projects/${projectId}/members/${username}`,
    );
  }

  addMember(projectId, username) {
    this.MEMBER_CACHE.removeAll();
    return this.$http.put(
      `${this.REST_ROOT}projects/${projectId}/members/${username}`,
    );
  }
}

export default ProjectFactory;

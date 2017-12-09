class ProjectController {
  constructor(project) {
    this.project = project;
  }
}

ProjectController.$inject = [ 'project' ];

export default ProjectController;

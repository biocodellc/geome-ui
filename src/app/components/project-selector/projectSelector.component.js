import '../../../style/fims/_projectSelector.scss';

const template = require('./projectSelector.html');

class ProjectSelectorController {
  constructor(ProjectService, $state, $mdDialog) {
    'ngInject';

    this.ProjectService = ProjectService;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.projects = [];
    this.filteredProjects = [];
    this.searchText = '';
    this.isOpen = false;
  }

  $onChanges(changesObj) {
    let filterProjects = false;
    if ('isAuthenticated' in changesObj) {
      this.includePublicProjects = !this.isAuthenticated;
      filterProjects = true;
    }

    if (changesObj.currentProject) {
      filterProjects = true;
    }

    if (filterProjects) this.filterProjects();
  }

  searchTextChange(searchText) {
    if (searchText === '') {
      this.filteredProjects = this.projects;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredProjects = this.projects.filter(
      p => p.projectTitle.toLowerCase().indexOf(sText) > -1,
    );
  }

  filterProjects(notMember = false) {
    // TODO can we define a schema on the User?
    // then we can return the ids of the projects a user is a member of, and make this a dumb component, just filtering here which is faster
    this.notMemberOfCurrentProject = notMember;
    this.ProjectService.all(this.includePublicProjects).then(({ data }) => {
      if (
        !this.includePublicProjects &&
        (data.length === 0 ||
          (this.currentProject &&
            !data.find(p => p.projectId === this.currentProject.projectId)))
      ) {
        this.includePublicProjects = true;
        this.notMemberOfCurrentProject = true;
        this.filterProjects(true);
        return;
      }
      this.projects = data;
      this.searchTextChange(this.searchText);
    });
  }

  change(project) {
    if (
      !this.currentProject ||
      project.projectId !== this.currentProject.projectId
    ) {
      this.onChange({ project });
    }
    this.$state.go('project-overview');
    this.searchText = '';
    this.isOpen = false;
  }

  signIn() {
    this.$mdDialog.cancel(this.$state.target('login')).then(() => {
      if (this.$state.current.name !== 'login') {
        this.$state.go('login', {
          nextState: this.$state.current.name,
          nextStateParams: this.$state.current.params,
        });
      }
    });
  }
}

export default {
  template,
  controller: ProjectSelectorController,
  bindings: {
    offset: '@',
    buttonClass: '@',
    currentProject: '<',
    onChange: '&',
    userHasProject: '<',
    isAuthenticated: '<',
  },
};

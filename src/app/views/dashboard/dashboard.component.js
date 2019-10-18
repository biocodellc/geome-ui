/* eslint-disable no-return-assign */
const template = require('./dashboard.html');

class DashboardController {
  constructor($state, ProjectService) {
    'ngInject';

    this.ProjectService = ProjectService;
    this.$state = $state;
  }

  $onInit() {
    this.loading = true;
    this.usersProjectTitles = [];
    this.ProjectService.all(true)
      .then(({ data }) => {
        this.allProjects = data;
      })
      .then(() =>
        this.ProjectService.all(false).then(({ data }) => {
          data.forEach(p => {
            this.usersProjectTitles.push(p.projectTitle);
          });
        }),
      )
      .then(() =>
        this.ProjectService.stats(true).then(({ data }) => {
          this.statsData = data;
        }),
      )
      .then(() => this.createTableData())
      .finally(() => (this.loading = false));
  }

  createTableData() {
    this.publicTableData = [];
    this.usersProjects = [];
    this.allProjects.forEach(p => {
      const el = this.statsData.find(s => s.projectTitle === p.projectTitle);
      this.publicTableData.push(el);
    });
    this.filteredPublicProjects = this.publicTableData;
    this.publicTableData.forEach(p => {
      if (this.usersProjectTitles.includes(p.projectTitle))
        this.usersProjects.push(p);
    });
    this.filteredPrivateProjects = this.usersProjects;
  }

  showExpeditionsDetail(projectId) {
    this.loading = true;
    const project = this.allProjects.find(p => p.projectId === projectId);
    this.ProjectService.setCurrentProject(project, true)
      .then(() => this.$state.go('overview'))
      .finally(() => (this.loading = false));
  }

  privateSearchTextChange(searchText) {
    if (searchText === '') {
      this.filteredPrivateProjects = this.usersProjects;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredPrivateProjects = this.usersProjects.filter(
      p => p.projectTitle.toLowerCase().indexOf(sText) > -1,
    );
  }

  publicSearchTextChange(searchText) {
    if (searchText === '') {
      this.filteredPublicProjects = this.publicTableData;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredPublicProjects = this.publicTableData.filter(
      p => p.projectTitle.toLowerCase().indexOf(sText) > -1,
    );
  }
}

export default {
  template,
  controller: DashboardController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
  },
};

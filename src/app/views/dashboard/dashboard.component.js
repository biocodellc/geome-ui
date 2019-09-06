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
    this.tableData = [];
    this.usersProjects = [];
    this.allProjects.forEach(p => {
      const el = this.statsData.find(s => s.projectTitle === p.projectTitle);
      const date = {
        dateModified: p.modified,
      };
      Object.assign(el, date);
      this.tableData.push(el);
    });
    this.filteredProjects = this.tableData;
    this.tableData.forEach(p => {
      if (this.usersProjectTitles.includes(p.projectTitle))
        this.usersProjects.push(p);
    });
  }

  showExpeditionsDetail(projectId) {
    this.loading = true;
    const project = this.allProjects.find(p => p.projectId === projectId);
    this.ProjectService.setCurrentProject(project, true)
      .then(() => this.$state.go('overview'))
      .finally(() => (this.loading = false));
  }

  searchTextChange(searchText) {
    if (searchText === '') {
      this.filteredProjects = this.tableData;
      return;
    }

    const sText = searchText.toLowerCase();
    this.filteredProjects = this.tableData.filter(
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

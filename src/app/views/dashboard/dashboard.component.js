const template = require('./dashboard.html');

class DashboardController {
  $onInit() {
    this.createPublicTable();
    this.createPrivateTable();
    this.filterPublicData(); // filter projects displayed under 'My Projects'
  }

  createPublicTable() {
    this.publicData = [];
    this.projects.data.forEach(p => {
      const el = this.stats.data.find(s => s.projectTitle === p.projectTitle);
      Object.assign(el, {
        hasPhotos:
          el.entityStats.Sample_PhotoCount > 0 ||
          el.entityStats.Event_PhotoCount > 0,
        hasSRA: el.entityStats.fastqMetadataCount > 0,
      });
      this.publicData.push(el);
    });
  }

  createPrivateTable() {
    this.privateData = [];
    this.private.data.forEach(p => {
      const el = this.stats.data.find(s => s.projectTitle === p.projectTitle);
      Object.assign(el, {
        hasPhotos:
          el.entityStats.Sample_PhotoCount > 0 ||
          el.entityStats.Event_PhotoCount > 0,
        hasSRA: el.entityStats.fastqMetadataCount > 0,
      });
      this.privateData.push(el);
    });
  }

  filterPublicData() {
    this.filteredPublicData = this.publicData.filter(
      p => !this.privateData.includes(p),
    );
  }
}

export default {
  template,
  controller: DashboardController,
  bindings: {
    currentUser: '<',
    currentProject: '<',
    stats: '<',
    projects: '<',
    private: '<',
  },
};

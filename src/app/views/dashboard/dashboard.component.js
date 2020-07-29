const template = require('./dashboard.html');

class DashboardController {
  $onInit() {
    this.createPublicTable();
    this.createPrivateTable();
    this.filterPublicData(); // filter out projects already listed under 'My Projects'
  }

  createPublicTable() {
    this.publicData = [];
    this.stats.data.forEach(s => {
      this.projects.data.forEach(p => {
        if (p.projectTitle === s.projectTitle)
          Object.assign(s, p.modified, {
            hasPhotos:
              s.entityStats.Sample_PhotoCount > 0 ||
              s.entityStats.Event_PhotoCount > 0,
            hasSRA: s.entityStats.fastqMetadataCount > 0,
          });
      });
      this.publicData.push(s);
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

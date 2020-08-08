const template = require('./dashboard.html');

class DashboardController {
  $onInit() {
    this.createPublicTable();
    this.createPrivateTable();
    this.filterPublicData(); // filter out projects already listed under 'My Projects'
  }

  createPublicTable() {
    this.publicData = [];
    this.stats.data.forEach(p => {
      Object.assign(p, {
        hasPhotos:
          p.entityStats.Sample_PhotoCount > 0 ||
          p.entityStats.Event_PhotoCount > 0,
        hasSRA: p.entityStats.fastqMetadataCount > 0,
      });
      this.publicData.push(p);
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
    private: '<',
  },
};

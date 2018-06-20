import angular from 'angular';

const template = require('./record.html');

class RecordController {
  constructor(ProjectConfigService) {
    'ngInject';

    this.ProjectConfigService = ProjectConfigService;
  }

  $onInit() {
    this.loading = true;
    this.bioProjectLink = null;
    this.bioSamplesLink = null;
  }

  $onChanges(changesObj) {
    if ('record' in changesObj && changesObj.record.currentValue) {
      this.fetchConfig();
      this.parent = this.record.parent;
      this.children = this.record.children || [];
      this.record = this.record.record;

      if (this.record.bioSample) {
        this.bioSamplesLink = `https://www.ncbi.nlm.nih.gov/bioproject/${
          this.record.bioSample.bioProjectId
        }`;
        this.bioProjectLink = `https://www.ncbi.nlm.nih.gov/biosample?LinkName=bioproject_biosample_all&from_uid=${
          this.record.bioSample.bioProjectId
        }`;
      }
    }
  }

  filterDisplayKeys(record) {
    return Object.keys(record).reduce((val, key) => {
      if (!['entity', 'bcid'].includes(key)) {
        val[key] = record[key];
      }
      return val;
    }, {});
  }

  fetchConfig() {
    this.loading = true;
    // shortcircuit if the config is already loaded
    if (
      this.currentProject &&
      this.currentProject.projectId === this.record.projectId
    ) {
      this.config = this.currentProject.config;
      this.loading = false;
      return;
    }

    this.ProjectConfigService.get(this.record.projectId)
      .then(config => {
        this.config = config;
      })
      .catch(() =>
        angular.toaster.error('Failed to fetch project configuration'),
      )
      .finally(() => {
        this.loading = false;
      });
  }
}

export default {
  template,
  controller: RecordController,
  bindings: {
    record: '<',
    currentProject: '<',
  },
};

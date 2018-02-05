const template = require('./query-detail.html');

class QueryDetailController {
  $onInit() {
    this.bcid = this.sample.bcid;
    this.bioProjectLink = null;
    this.bioSamplesLink = null;

    const { fastqMetadata } = this.sample;
    delete this.sample.bcid;
    delete this.sample.fastqMetadata;

    if (fastqMetadata && fastqMetadata.bioSample) {
      this.bioSamplesLink = `https://www.ncbi.nlm.nih.gov/bioproject/${
        fastqMetadata.bioSample.bioProjectId
      }`;
      this.bioProjectLink = `https://www.ncbi.nlm.nih.gov/biosample?LinkName=bioproject_biosample_all&from_uid=${
        fastqMetadata.bioSample.bioProjectId
      }`;
    }
  }
}

export default {
  template,
  controller: QueryDetailController,
  bindings: {
    sample: '<',
  },
};

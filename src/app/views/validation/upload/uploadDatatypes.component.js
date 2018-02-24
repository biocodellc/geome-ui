const template = require('./uploadDatatypes.html');

class DataTypesController {
  $onInit() {
    this.fims = true; // only temporary
    this.fasta = false;
    this.fastq = false;
    this.datatypesChange(); // only temporary
    this.dataTypeSelected = true;
  }

  $onChanges(changesObj) {
    if ('config' in changesObj && changesObj.config.currentValue) {
      this.fastaEnabled = this.config.entities.some(e => e.type === 'Fasta');
    }
  }

  datatypesChange() {
    this.dataTypeSelected = this.fims || this.fasta || this.fastq;
    this.onUpdate({
      dataTypes: {
        fims: this.fims,
        fasta: this.fasta,
        fastq: this.fastq,
      },
    });
  }
}

export default {
  template,
  controller: DataTypesController,
  bindings: {
    newExpedition: '<',
    config: '<',
    onUpdate: '&',
  },
};

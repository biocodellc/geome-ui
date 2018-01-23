class DataTypesController {

  $onInit() {
    this.fims = true; // only temporary
    this.fasta = false;
    this.fastq = false;
    this.datatypesChange(); // only temporary
  }

  datatypesChange() {
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
  template: require('./uploadDatatypes.html'),
  controller: DataTypesController,
  bindings: {
    newExpedition: '<',
    onUpdate: '&',
  },
};
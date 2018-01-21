class DataTypesController {

  $onInit() {
    this.fims = false;
    this.fasta = false;
    this.fastq = false;
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
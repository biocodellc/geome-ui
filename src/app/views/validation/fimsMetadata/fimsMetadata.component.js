class FimsMetadataController {
  $onInit() {
    this.valid = true;
  }

  $onChanges(changesObj) {
    if ('fimsMetadata' in changesObj) {
      this.selected = changesObj.fimsMetadata.currentValue;
      //TODO fix this. This is called 2times, b/c we are mutating the passed in property. not sure how to copy a file object
    }
  }

  handleSelect($files) {
    this.valid = !!($files[ 0 ]);
    this.onChange({ fimsMetadata: $files[ 0 ] });
  }
}

export default {
  template: require('./fimsMetadata.html'),
  controller: FimsMetadataController,
  bindings: {
    fimsMetadata: '<',
    required: '<',
    onChange: '&',
  },
}
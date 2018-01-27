const template = require('./expedition-metadata.html');

export class ExpeditionMetadataController {
  constructor(ConfirmationService) {
    'ngInject';

    this.ConfirmationService = ConfirmationService;
  }

  $onChanges(changesObj) {
    if ('properties' in changesObj) {
      this.properties = changesObj.properties.currentValue.slice();

      if (
        this.properties.length > 0 &&
        this.properties[this.properties.length - 1].isNew
      ) {
        this.editProp = this.properties.length - 1;
      }
    }
  }

  handleOnUpdate(index, prop) {
    this.properties.splice(index, 1, prop);
    this.onUpdate({ expeditionMetadata: this.properties });
  }

  handleOnDelete(index) {
    this.ConfirmationService.confirm(
      `Are you sure you want to delete this property? <strong>This will not delete existing data.</strong>`,
      () => {
        this.properties.splice(index, 1);
        this.onUpdate({ expeditionMetadata: this.properties });
      },
    );
  }

  handleToggleEdit(index) {
    if (this.editProp === index) {
      delete this.editProp;
    } else {
      this.editProp = index;
    }
  }
}

export default {
  template,
  controller: ExpeditionMetadataController,
  bindings: {
    properties: '<',
    onUpdate: '&',
  },
};

const template = require('./uploadDatatypes.html');

class DataTypesController {
  $onInit() {
    this.touched = false;
    this.dataTypeSelected = false;
    this.dataTypes = {};

    if (this.availableTypes && this.availableTypes.length > 0) {
      this.dataTypes[this.availableTypes[0].name] = true;
      this.handleChange();
    }
  }

  $onChanges(changesObj) {
    if ('dataTypes' in changesObj && this.dataTypes) {
      this.dataTypes = Object.assign({}, this.dataTypes);
    }
  }

  handleChange(selected) {
    this.dataTypeSelected = Object.values(this.dataTypes).some(v => v);
    this.touched = true;

    if (selected) {
      const isWorkbook = selected === 'Workbook';
      const isWorksheet = isWorkbook
        ? false
        : this.availableTypes.find(t => t.name === selected).isWorksheet;

      Object.keys(this.dataTypes).forEach(type => {
        if (isWorksheet) this.dataTypes.Workbook = false;
        else if (
          isWorkbook &&
          this.dataTypes.Workbook &&
          this.availableTypes.find(t => t.name === type && t.isWorksheet)
        ) {
          this.dataTypes[type] = false;
        }
      });
    }

    this.onUpdate({
      dataTypes: this.dataTypes,
    });
  }
}

export default {
  template,
  controller: DataTypesController,
  bindings: {
    availableTypes: '<',
    dataTypes: '<',
    onUpdate: '&',
  },
};

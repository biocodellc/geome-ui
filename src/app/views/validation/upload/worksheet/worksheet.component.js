const template = require('./worksheet.html');

class WorksheetController {
  $onInit() {
    this.valid = true;
  }

  // TODO validations if childEntity is selected or if newExpedition is selected
  handleSelect($files) {
    this.valid = !!$files[0];
    this.file = $files[0];
    this.handleChange();
  }

  handleChange() {
    this.onChange({
      worksheet: this.worksheet,
      file: this.file,
      reload: this.reload,
    });
  }

  fileTypes() {
    if (this.worksheet === 'Workbook') {
      return "'.xls,.xlsx'";
    }
    return "'.txt,.csv,.tsv'";
  }
}

export default {
  template,
  controller: WorksheetController,
  bindings: {
    required: '<',
    worksheet: '<',
    file: '<',
    onChange: '&',
  },
};

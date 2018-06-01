const template = require('./worksheet.html');

class WorksheetController {
  $onInit() {
    this.valid = true;
  }

  // TODO validations if childEntity is selected or if newExpedition is selected
  handleSelect($files) {
    this.valid = !!$files[0];
    this.file = $files[0];
    this.onChange({
      worksheet: this.worksheet,
      file: this.file,
    });
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

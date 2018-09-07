import '../../../style/fims/_mdFileUpload.scss';

const template = require('./md-file-upload.html');

class Controller {
  constructor($scope, $element, $animate) {
    'ngInject';

    this.$scope = $scope;
    this.$element = $element;
    this.$animate = $animate;
  }
  $onInit() {
    if (!this.hints) this.hints = [];

    const fileInput = this.$element.find('input[name=file]');
    this.$scope.$watch(
      () => {
        if (!this.ngModelCtrl)
          this.ngModelCtrl = fileInput.controller('ngModel');
        return (
          this.ngModelCtrl.$invalid &&
          (this.ngModelCtrl.$touched || this.form.$submitted)
        );
      },
      invalid => {
        if (invalid) {
          this.isValid = false;
          this.$animate.addClass(this.$element, 'md-input-invalid');
        } else {
          this.isValid = true;
          this.$animate.removeClass(this.$element, 'md-input-invalid');
        }
      },
    );
  }

  handleSelect(files) {
    this.ngModelCtrl.$setTouched(true);
    if (this.multiple) {
      this.onSelect({ files });
    } else {
      this.onSelect({ files: files[0] });
    }
  }
}

export default {
  template,
  controller: Controller,
  bindings: {
    multiple: '<',
    file: '<',
    required: '<',
    pattern: '@',
    hints: '<',
    text: '@',
    onSelect: '&',
  },
  require: {
    form: '^form',
  },
};

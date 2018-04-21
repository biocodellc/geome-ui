import UploadMap from '../../views/validation/upload/UploadMap';

import '../../../style/fims/_uploadMapDialog.scss';

const template = require('./uploadMapDialog.html');

class UploadMapDialogController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  $onInit() {
    this.map = new UploadMap(this.latColumn, this.lngColumn, this.uniqueKey);
    this.map.on(UploadMap.INIT_EVENT, () => this.map.setMarkers(this.data));
  }

  cancel() {
    this.$mdDialog.cancel();
  }

  ok() {
    this.$mdDialog.hide(true);
  }
}

export default {
  template,
  controller: UploadMapDialogController,
  bindings: {
    data: '<',
    latColumn: '<',
    lngColumn: '<',
    uniqueKey: '<',
  },
};

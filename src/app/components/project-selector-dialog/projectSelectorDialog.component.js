import '../../../style/fims/_projectSelectorDialog.scss';

const template = require('./projectSelectorDialog.html');

class ProjectSelectorDialogController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  cancel() {
    this.$mdDialog.cancel();
  }

  select(project) {
    this.$mdDialog.hide(project);
  }
}

export default {
  template,
  controller: ProjectSelectorDialogController,
  bindings: {
    isAuthenticated: '<',
  },
};

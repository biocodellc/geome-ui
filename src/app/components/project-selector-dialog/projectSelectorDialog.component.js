import '../../../style/fims/_projectSelectorDialog.scss';

const template = require('./projectSelectorDialog.html');

class ProjectSelectorDialogController {
  constructor($mdDialog, $state) {
    'ngInject';

    this.$mdDialog = $mdDialog;
    this.$state = $state;
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

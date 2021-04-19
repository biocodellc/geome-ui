import '../../../../style/fims/_tkLabels.scss';

const template = require('./collaboration.html');

class CollaborationController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  showCollaborationMessage() {
    this.$mdDialog.show(
      this.$mdDialog
        .alert()
        .clickOutsideToClose(true)
        .title('Open to Collaborate')
        .htmlContent(
          'GEOME is committed to the development of new modes of collaboration, engagement, and partnership for the care and stewardship of tangible and intangible biocultural materials. See <a href="https://localcontexts.org/notices/cultural-institution-notices/" target=_blank><i>Local Contexts</i></a> for more information ',
        )
        .ariaLabel('attribution message')
        .ok('Close'),
    );
  }
}

export default {
  template,
  controller: CollaborationController,
};

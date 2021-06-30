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
          'GEOME is committed to the development of new modes of collaboration, engagement, and partnership over Indigenous collections and data that have colonial and/or problematic histories or unclear provenance. This notice indicates an institutional commitment to change and to develop new processes for the care and stewardship of past and future heritage collections. See <a href="https://localcontexts.org/notice/open-to-collaborate/" target=_blank><i>Local Contexts</i></a> for more information',
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

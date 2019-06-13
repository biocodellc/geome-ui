import '../../../style/fims/_tkLabels.scss';

const template = require('./tkLabels.html');

class TKLabelsController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  showCollaborationMessage() {
    this.$mdDialog.show(
      this.$mdDialog
        .alert()
        .clickOutsideToClose(true)
        .title('Traditional Knowledge Label: Open to Collaborate')
        .htmlContent(
          'GEOME is committed to the development of new modes of collaboration, engagement, and partnership for the care and stewardship of tangible and intangible biocultural materials. See <a href="https://localcontexts.org/ci-labels" target=_blank><i>Local Contexts</i></a> for more information ',
        )
        .ariaLabel('attribution message')
        .ok('Close'),
    );
  }

  showAttributionMessage() {
    this.$mdDialog.show(
      this.$mdDialog
        .alert()
        .clickOutsideToClose(true)
        .title('Traditional Knowledge Label: Attribution')
        .htmlContent(
          'GEOME asks all future users to record and display all metadata elements in downstream systems and use, particularly those records indicating landowner, locality, permitInformation, collectors, eventRemarks, and occurrenceRemarks. See <a href="https://localcontexts.org" target=_blank><i>Local Contexts</i></a> for more information',
        )
        .ariaLabel('attribution message')
        .ok('Close'),
    );
  }
}

export default {
  template,
  controller: TKLabelsController,
};

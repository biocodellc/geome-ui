import '../../../../style/fims/_tkLabels.scss';

const template = require('./attribution.html');

class AttributionController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  showAttributionMessage() {
    this.$mdDialog.show(
      this.$mdDialog
        .alert()
        .clickOutsideToClose(true)
        .title('Attribution')
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
  controller: AttributionController,
};

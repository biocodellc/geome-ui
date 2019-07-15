import '../../../../style/fims/_tkLabels.scss';

const template = require('./notice.html');

class NoticeController {
  constructor($mdDialog) {
    'ngInject';

    this.$mdDialog = $mdDialog;
  }

  showNoticeMessage() {
    this.$mdDialog.show(
      this.$mdDialog
        .alert()
        .clickOutsideToClose(true)
        .title('Traditional Knowledge Notice')
        .htmlContent(
          'The Traditional Knowledge (TK) Notice that appears here serves as a visible notification that there is accompanying cultural rights and responsibilities that need further attention for any future sharing and use of this material.   The TK Notice is intended to be a collective notice and an initiative to elevate recognition of the cultural significance, importance and often placed-based nature of TK. The TK Notice may indicate that TK Labels or Biocultural (BC) Labels are in development and their implementation is being negotiated. For more information about TK and BC Labels visit <a href="http://localcontexts.org/tk-labels/" target="_blank"> <i>local contexts</i></a>',
        )
        .ariaLabel('TK notice message')
        .ok('Close'),
    );
  }
}

export default {
  template,
  controller: NoticeController,
};

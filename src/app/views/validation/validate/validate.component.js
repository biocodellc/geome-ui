import { getFileExt } from '../../../utils/utils';

const template = require('./validate.html');

class ValidateController {
  validate() {
    if (!this.fimsMetadata) return;

    const data = {};

    if (['xlsx', 'xls'].includes(getFileExt(this.fimsMetadata.name))) {
      data.workbooks = [this.fimsMetadata];
    } else {
      data.dataSourceMetadata = [
        {
          dataType: 'TABULAR',
          filename: this.fimsMetadata.name,
          reload: true,
          metadata: {
            sheetName: 'Samples', // TODO this needs to be dynamic, depending on the entity being validated
          },
        },
      ];
      data.dataSourceFiles = [this.fimsMetadata];
    }

    this.onValidate({ data });
  }
}

export default {
  template,
  controller: ValidateController,
  bindings: {
    fimsMetadata: '<',
    onMetadataChange: '&',
    onValidate: '&',
  },
};

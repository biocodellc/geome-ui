import angular from 'angular';
import fileService from './file.service';

import config from '../utils/config';
const { restRoot } = config;

class DataService {
  constructor($http, Upload, FileService) {
    'ngInject';

    this.$http = $http;
    this.Upload = Upload;
    this.FileService = FileService;
  }

  /**
   * Workbooks are an excel workbook with 1+ worksheets. Each worksheet that has a corresponding entity in the
   * ProjectConfig, will be validated. The rest will be ignored.
   *
   * dataSources can be either a dataset that isn't represented by a workbook, such as fasta/fastq data,
   * or csv/tsv files instead of a workbook. Each dataSourceFile must have a corresponding dataSourceMetadata object.
   *
   * dataSourceMetadata:
   *
   * {
   *   dataType: <string>, the DataReaderType to use to read the file. supported types are ['TABULAR']
   *   filename: <string>, the name of the file in dataSourceFiles this metadata represents.
   *   reload: <boolean>, Remove any existing records not included in this upload. Note: some entities prevent reloads and will ignore this value
   *   metadata: {
   *     key: value, // metadata required for the specific DataReader. TODO insert a link to the docs on this
   *     ...,
   *   }
   * }
   *
   * At least 1 workbook or dataSource is required to be validated.
   *
   * @param data.projectId int The projectId this dataset belongs to
   * @param data.expeditionCode string  The expedition this dataset belongs to
   * @param data.dataSourceMetadata (optional) Array<Object>  Metadata objects for each dataset to upload. Each
   *                                                          dataSourceFile must have a corresponding metadata object
   * @param data.dataSourceFiles (optional) Array<File>  Files for each dataset to upload. Each
   *                                                     file must have a corresponding metadata object
   * @param data.workbooks (optional) File  The excel workbook to validate. Either this or dataSourceFiles/Metadata must be
   * @param data.upload boolean  Is this data to be uploaded or only validated?
   * @param data.reloadWorkbooks boolean  Remove any existing records not included in this upload. This only applies to
   *                                      data.workbooks Note: some entities prevent reloads and will ignore this value
   */
  validate(data) {
    if (data.dataSourceMetadata) {
      data.dataSourceMetadata = this.Upload.jsonBlob(data.dataSourceMetadata);
    }
    return this.Upload.upload({
      url: `${restRoot}data/validate`,
      data,
      arrayKey: '',
    }).catch(angular.catcher('Data validation failed'));
  }

  upload(uploadId) {
    return this.$http
      .put(`${restRoot}data/upload/${uploadId}`)
      .catch(angular.catcher('Data upload failed'));
  }

  exportData(projectId, expeditionCode) {
    return this.$http
      .get(`${restRoot}data/export/${projectId}/${expeditionCode}`)
      .then(response => {
        if (response.status === 204) {
          angular.alerts.info('No resources found');
          return;
        }
        return this.FileService.download(response.data.url);
      })
      .catch(angular.catcher('Failed to export data'));
  }
}

export default angular
  .module('fims.data', [fileService])
  .service('DataService', DataService).name;

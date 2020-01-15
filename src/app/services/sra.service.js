import angular from 'angular';

import config from '../utils/config';

const { restRoot } = config;

class SraService {
  constructor($http, Upload) {
    'ngInject';

    this.$http = $http;
    this.Upload = Upload;
  }

  upload(metadata, file, isResume = false) {
    const progressCallbacks = [];

    const onSuccess = res => res.data;
    const onFail = angular.catcher(
      'SRA upload failed',
      { name: 'close', fn: () => {} },
      {
        hideDelay: 0,
      },
    );
    const onProgress = event => progressCallbacks.forEach(fn => fn(event));

    const p = this.$http({
      method: 'PUT',
      url: `${restRoot}sra/upload`,
      data: metadata,
      keepJson: true,
    })
      .then(({ data }) => {
        if (!data) {
          return Promise.reject(new Error('Upload initialization failed.'));
        }

        const { uploadId: id } = data;

        return this.Upload.http({
          url: `${restRoot}sra/upload`,
          method: 'PUT',
          data: file,
          headers: {
            'Content-Type': file.type,
          },
          keepJson: true,
          params: {
            id,
            type: isResume ? 'resume' : 'resumable',
          },
          resumeSize: isResume ? () => this.getResumeSize(id) : undefined,
        }).then(onSuccess, onFail, onProgress);
      })
      .catch(e => onFail(e) && {});

    p.progress = fn => {
      if (fn && typeof fn === 'function') {
        progressCallbacks.push(fn);
      }
      return p;
    };

    return p;
  }

  getResumeSize(id) {
    return this.$http({
      url: `${restRoot}sra/upload/progress`,
      params: { id },
    })
      .then(response => response.data.size || 0)
      .catch(response => {
        if (response.status !== 400) {
          angular.catcher('Error fetching resume upload size')(response);
        }
        return 0;
      });
  }
}

export default angular
  .module('fims.sraService', [])
  .service('SraService', SraService).name;

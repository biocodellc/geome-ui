import angular from 'angular';

import config from '../utils/config';

const { restRoot } = config;

class PhotosService {
  constructor($http, $interval, Upload, FileService) {
    'ngInject';

    this.$http = $http;
    this.$interval = $interval;
    this.Upload = Upload;
    this.FileService = FileService;
  }

  upload(projectId, expeditionCode, entity, file, isResume = false) {
    const progressCallbacks = [];

    const onSuccess = res => res;
    const onFail = angular.catcher('Photo upload failed');
    const onProgress = event => progressCallbacks.forEach(fn => fn(event));

    const p = this.Upload.http({
      url: `${restRoot}photos/${entity}/upload`,
      method: 'PUT',
      data: file,
      headers: {
        'Content-Type': file.type,
      },
      keepJson: true,
      params: {
        projectId,
        expeditionCode,
        type: isResume ? 'resume' : 'resumable',
      },
      resumeSize: isResume
        ? () => this.getResumeSize(projectId, expeditionCode, entity)
        : undefined,
    }).then(onSuccess, onFail, onProgress);

    p.progress = fn => {
      if (fn && typeof fn === 'function') {
        progressCallbacks.push(fn);
      }
      return p;
    };

    return p;
  }

  getResumeSize(projectId, expeditionCode, entity) {
    return this.$http
      .get(
        `${restRoot}photos/${entity}/upload/progress?expeditionCode=${expeditionCode}&projectId=${projectId}`,
      )
      .catch(response => {
        if (response.status !== 400) {
          angular.catcher('Error fetching resume upload size')(response);
        }
        return 0;
      });
  }
}

export default angular
  .module('fims.photosService', [])
  .service('PhotosService', PhotosService).name;

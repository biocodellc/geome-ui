import angular from 'angular';

const config = $httpProvider => {
  $httpProvider.interceptors.push('postInterceptor');
};

config.$inject = ['$httpProvider'];

class PostInterceptor {
  request(config) {
    // when uploading files with ng-file-upload, the content-type is undefined. The browser
    // will automatically set it to multipart/form-data if we leave it as undefined
    if (
      (config.method === 'POST' || config.method === 'PUT') &&
      config.headers['Content-Type'] !== undefined &&
      !config.keepJson
    ) {
      config.headers['Content-Type'] =
        'application/x-www-form-urlencoded; charset=UTF-8';
      if (config.data instanceof Object)
        config.data = config.paramSerializer(config.data);
    }

    return config;
  }
}

export default angular
  .module('interceptors.post-interceptor', [])
  .service('postInterceptor', PostInterceptor)
  .config(config).name;

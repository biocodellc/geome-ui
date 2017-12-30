import angular from "angular";
import authService from './auth.service';


class FileService {
  constructor($window, AuthService) {
    'ngInject';
    this.window = $window;
    this.authService = AuthService;
  }

  download(urlString) {
    const access_token = this.authService.getAccessToken();
    let url = new URL(urlString);

    const parser = document.createElement('a');
    parser.href = url;

    if (access_token) {
      if (parser.search) {
        url += '&access_token=' + access_token;
      } else {
        url += '?access_token=' + access_token;
      }
    }

    this.window.open(url, "_self");
  }

}

export default angular.module('fims.fileService', [ authService ])
  .service('FileService', FileService)
  .name;

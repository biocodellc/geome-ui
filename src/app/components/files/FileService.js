class FileService {
  constructor($window, AuthService) {
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

FileService.$inject = [ '$window', 'AuthService' ];
export default FileService;

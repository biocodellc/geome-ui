class AuthInterceptor {
  constructor($injector, $templateCache) {
    'ngInject';

    this.injector = $injector;
    this.templateCache = $templateCache;
    this.triedToRefresh = false;
  }

  // angular only keeps reference of the methods, so we need to use arrow functions to keep 'this' context
  request = (config) => {
    // only add query string if the request url isn't in the $templateCache
    if (this.templateCache.get(config.url) === undefined) {
      const AuthService = this.injector.get('AuthService');
      const accessToken = AuthService.getAccessToken();
      if (accessToken) {
        config.params = config.params || {};
        config.params.access_token = accessToken;
      }
    }
    return config;
  };

  responseError = (response) => {
    if (!this.triedToRefresh &&
      (response.status === 401 || (response.status === 400 && response.data.usrMessage === 'invalid_grant' ))) {
      const AuthService = this.injector.get('AuthService');

      const origRequestConfig = response.config;
      this.triedToRefresh = true;

      return AuthService.refreshAccessToken()
        .then(() => {
          this.triedToRefresh = false;
          const $http = this.injector.get("$http");
          return $http(origRequestConfig);
        })
        .catch(() => {
          this.triedToRefresh = false;
          return this.state.go('login', { nextState: this.state.current.name, nextStateParams: this.state.params });
        });
    }

    return Promise.reject(response);
  };
}

export default AuthInterceptor;

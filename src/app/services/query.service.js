import angular from 'angular';
import config from '../utils/config';
import authService from './auth.service';

const { restRoot } = config;

class QueryService {
  constructor($http, $window, AuthService) {
    'ngInject';

    this.$http = $http;
    this.$window = $window;
    this.AuthService = AuthService;
  }

  queryJson(query, page, limit) {
    angular.alerts.removeTmp();

    return this.$http({
      method: 'GET',
      url: `${restRoot}projects/query/json/?limit=${limit}&page=${page}`,
      params: query,
      keepJson: true,
    }).then(response => {
      const results = {
        size: 0,
        totalElements: 0,
        data: [],
      };

      if (response.data) {
        results.size = response.data.size;

        // TODO: I think we can remove this b/c we aren't using es anymore
        // if (response.data.totalElements > 10000) {
        // elasitc_search will throw an error if we try and retrieve results from 10000 and greater
        // results.totalElements = 10000;
        // alerts.info("Query results are limited to 10,000. Either narrow your search or download the results to view everything.")
        // } else {
        results.totalElements = response.data.totalElements;
        // }

        if (results.totalElements === 0) {
          angular.alerts.info('No results found.');
        }

        results.data = response.data.content;
      }

      return results;
    });
  }

  downloadExcel(query) {
    this.download('excel', query);
  }

  downloadKml(query) {
    this.download('kml', query);
  }

  downloadCsv(query) {
    this.download('csv', query);
  }

  downloadFasta(query) {
    this.download('fasta', query);
  }

  downloadFastq(query) {
    this.download('fastq', query);
  }

  download(path, query) {
    return this.$http({
      method: 'GET',
      url: `${restRoot}projects/query/${path}`,
      params: query,
      keepJson: true,
    })
      .then(response => {
        if (response.status === 204) {
          angular.alerts.info('No results found.');
          return;
        }

        const accessToken = this.AuthService.getAccessToken();
        let url = new URL(response.data.url);

        const parser = this.$window.document.createElement('a');
        parser.href = url;

        if (accessToken) {
          if (parser.search) {
            url += `&access_token=${accessToken}`;
          } else {
            url += `?access_token=${accessToken}`;
          }
        }

        this.$window.open(url, '_self');
      })
      .catch(angular.exception.catcher('Failed downloading file!'));
  }
}

export default angular
  .module('fims.queryService', [authService])
  .service('QueryService', QueryService).name;

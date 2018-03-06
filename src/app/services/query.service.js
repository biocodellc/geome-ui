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

  queryJson(query, projectId, entity, page, limit) {
    angular.alerts.removeTmp();

    return this.$http({
      method: 'GET',
      url: `${restRoot}projects/${projectId}/query/json/${entity}?limit=${limit}&page=${page}`,
      params: query,
      keepJson: true,
    }).then(response => {
      const results = {
        page: 0,
        size: 0,
        totalElements: 0,
        data: [],
      };

      if (response.data) {
        results.size = response.data.size;
        results.page = response.data.number;

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

  downloadExcel(query, projectId, entity) {
    this.download('excel', query, projectId, entity);
  }

  downloadKml(query, projectId, entity) {
    this.download('kml', query, projectId, entity);
  }

  downloadCsv(query, projectId, entity) {
    this.download('csv', query, projectId, entity);
  }

  downloadFasta(query, projectId, entity) {
    this.download('fasta', query, projectId, entity);
  }

  downloadFastq(query, projectId, entity) {
    this.download('fastq', query, projectId, entity);
  }

  download(path, query, projectId, entity) {
    return this.$http({
      method: 'GET',
      url: `${restRoot}projects/${projectId}/query/${entity}/${path}`,
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
  .module('fims.QueryService', [authService])
  .service('QueryService', QueryService).name;

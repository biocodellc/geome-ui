import angular from 'angular';
// sly doesn't export anything. we import here so webpack will bundle/load the file
// then we use the angular module loader to list as a dependency
import '../../../vendor/scalyr';

import router from '../../utils/router';
import QueryService from '../../services/query.service';
import projectService from '../../services/project.service';

import routing from './query.routes';

import fimsMap from '../../components/map';
import fimsQuery from './query.component';
import fimsQueryForm from './form/query-form.component';
import fimsQueryDetail from './detail/query-detail.component';
import fimsQueryTable from './table/query-table.component';

const dependencies = ['sly', router, QueryService, projectService, fimsMap];

export default angular
  .module('fims.query', dependencies)
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .component('fimsQuery', fimsQuery)
  .component('fimsQueryForm', fimsQueryForm)
  .component('fimsQueryDetail', fimsQueryDetail)
  .component('fimsQueryTable', fimsQueryTable).name;

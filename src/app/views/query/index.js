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
import fimsTeamQuery from './team-query/team-query.component';
import amphibianDisease from './team-query/amphibian-disease/amphibian-disease.component';
import fimsQueryTable from './table/query-table.component';
import fimsFilterButtons from './form/filter-buttons/filter-buttons.component';

const dependencies = ['sly', router, QueryService, projectService, fimsMap];

export default angular
  .module('fims.query', dependencies)
  .run(routing) // need to declare in run block. otherwise $transitions is not available
  .component('fimsQuery', fimsQuery)
  .component('fimsQueryForm', fimsQueryForm)
  .component('amphibianDisease', amphibianDisease)
  .component('fimsTeamQuery', fimsTeamQuery)
  .component('fimsQueryTable', fimsQueryTable)
  .component('fimsFilterButtons', fimsFilterButtons).name;

import angular from 'angular';

import fimsProjectConfigEntities from './entities.component';
import projectConfigEntity from './entity.component';
import projectConfigEntityDetail from './entity-detail.component';

export default angular
  .module('fims.projectConfigEntities', [
    projectConfigEntity,
    projectConfigEntityDetail,
  ])
  .component('fimsProjectConfigEntities', fimsProjectConfigEntities).name;

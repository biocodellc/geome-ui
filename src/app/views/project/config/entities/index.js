import angular from 'angular';

import fimsProjectConfigEntities from './entities.component';
import projectConfigEntity from './entity.component';
import projectConfigEntityDetail from './entity-detail.component';
import projectConfigEntityAdd from './add-entity.component';

export default angular.module('fims.projectConfigEntities', [ projectConfigEntity, projectConfigEntityDetail, projectConfigEntityAdd ])
  .component('fimsProjectConfigEntities', fimsProjectConfigEntities)
  .name;

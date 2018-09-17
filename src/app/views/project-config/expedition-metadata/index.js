import angular from 'angular';

import fimsExpeditionMetadataPropertiesList from './expedition-metadata.component';
import fimsEditProp from './edit-prop.component';

export default angular
  .module('fims.projectConfigExpeditionMetadata', [fimsEditProp])
  .component(
    'fimsExpeditionMetadataPropertiesList',
    fimsExpeditionMetadataPropertiesList,
  ).name;

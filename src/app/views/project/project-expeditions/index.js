import fimsExpeditions from "../../../components/expeditions";
import fimsExpedition from "../../../components/expeditions/expedition.component";

import routing from "./project-expeditions.routes";
import fimsProjectExpeditions from './project-expeditions.component';
import fimsProjectExpedition from "./project-expedition.component";


export default angular.module('fims.projectExpeditions', [ fimsExpeditions, fimsExpedition ])
  .run(routing)
  .component('fimsProjectExpeditions', fimsProjectExpeditions)
  .component('fimsProjectExpedition', fimsProjectExpedition)
  .name;

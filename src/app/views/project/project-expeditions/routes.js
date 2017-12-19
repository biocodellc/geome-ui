import ExpeditionController from "../../../components/expeditions/expedition.controller";
import ExpeditionSettingsController from "../../../components/expeditions/expedition-settings.controller";
import ExpeditionResourcesController from "../../../components/expeditions/expedition-resources.controller";

const expeditionDetailTemplate = require('../../../components/expeditions/expedition-detail.html');

function getStates() {
  return [
    {
      state: 'project.expeditions',
      config: {
        url: '/expeditions',
        resolve: {
          expeditions: /*ngInject*/ ($state, currentProject, ExpeditionService) =>
            ExpeditionService.all(currentProject.projectId)
              .then(response => response.data)
              .catch(() => $state.go('project')),
        },
        views: {
          "details": {
            component: 'fimsProjectExpeditions',

          },
        },
      },
    },
    {
      state: 'project.expeditions.detail',
      config: {
        url: '/:id',
        // onEnter: expeditionDetailOnEnter,
        redirectTo: "project.expeditions.detail.settings",
        resolve: {
          expedition: /*ngInject*/ ($transition$, $state, expeditions) => {
            let expedition = $transition$.params().expedition;
            if (expedition) {
              return expedition;
            }

            const id = $transition$.params().id;
            expedition = expeditions.find(e => e.expeditionId === id);

            if (expedition) {
              return expedition;
            }

            return $state.go('project.expeditions');
          },
          backState: () => "project.expeditions",
        },
        views: {
          "@": {
            //TODO make this a component
            template: `<div class="admin" >${expeditionDetailTemplate}</div>`,
            controller: ExpeditionController,
            controllerAs: 'vm',
          },
        },
        params: {
          id: {
            type: "int",
          },
          expedition: {},
        },
      },
    },
    {
      state: 'project.expeditions.detail.settings',
      config: {
        url: '/settings',
        views: {
          "details": {
            template: require('../../../components/expeditions/expedition-detail-settings.html'),
            controller: ExpeditionSettingsController,
            controllerAs: 'vm',
          },
        },
      },
    },
    {
      state: 'project.expeditions.detail.resources',
      config: {
        url: '/resources',
        views: {
          "details": {
            template: require('../../../components/expeditions/expedition-detail-resources.html'),
            controller: ExpeditionResourcesController,
            controllerAs: 'vm',
          },
        },
      },
    },
    {
      state: 'project.expeditions.detail.members',
      config: {
        url: '/members',
        views: {
          "details": {
            template: require('../../../components/expeditions/expedition-detail-members.html'),
            // controller: "ExpeditionMembersController as vm"
          },
        },
      },
    },
  ]
}

export default (routerHelper) => {
  'ngInject';
  routerHelper.configureStates(getStates());
};

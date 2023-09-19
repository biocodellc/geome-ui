import compareValues from '../../../utils/compareValues';

const expeditionMemberTemplate = require('../../../components/expeditions/expedition-members.html');

function getStates() {
  return [
    {
      state: 'project.expeditions',
      config: {
        url: '/expeditions',
        resolve: {
          expeditions: /* @ngInject */ (
            $state,
            ProjectService,
            ExpeditionService,
          ) =>
			ExpeditionService.getExpeditionsForUser( ProjectService.currentProject().projectId, true)
			//
            //ExpeditionService.all(ProjectService.currentProject().projectId)
              .then(({ data }) => data.sort(compareValues('expeditionTitle')))
              .catch(() => $state.go('project')),
        },
        views: {
          'details@project': {
            component: 'fimsProjectExpeditions',
          },
        },
      },
    },
    {
      state: 'project.expeditions.detail',
      config: {
        url: '/:id',
        redirectTo: 'project.expeditions.detail.settings',
        resolve: {
          expedition: /* @ngInject */ ($transition$, $state, expeditions) => {
            let { expedition } = $transition$.params();
            if (expedition && Object.keys(expedition).length) {
              return expedition;
            }

            const { id } = $transition$.params();
            expedition = expeditions.find(e => e.expeditionId === id);

            if (expedition) {
              return expedition;
            }

            return $state.go('project.expeditions');
          },
          backState: () => 'project.expeditions',
          currentProject: /* @ngInject */ ProjectService =>
            ProjectService.currentProject(),
        },
        views: {
          // target the default ui-view for the `project` state
          '@project': {
            component: 'fimsProjectExpedition',
          },
        },
        params: {
          id: {
            type: 'int',
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
          details: {
            component: 'fimsExpeditionSettings',
          },
        },
      },
    },
    {
      state: 'project.expeditions.detail.resources',
      config: {
        url: '/resources',
        views: {
          details: {
            component: 'fimsExpeditionResources',
          },
        },
      },
    },
    {
      state: 'project.expeditions.detail.members',
      config: {
        url: '/members',
        views: {
          details: {
            template: expeditionMemberTemplate,
          },
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

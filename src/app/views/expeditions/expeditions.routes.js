import compareValues from '../../utils/compareValues';

const expeditionMembersTemplate = require('../../components/expeditions/expedition-members.html');

function getStates() {
  return [
    {
      state: 'expeditions',
      config: {
        parent: 'projectView',
        abstract: true,
        template:
          '<div ui-view class="admin" current-user="$ctrl.currentUser" current-project="$ctrl.currentProject"></div>',
        resolve: {
          expeditions: /* @ngInject */ (
            $state,
            ExpeditionService,
            ProjectService,
          ) =>
            ExpeditionService.getExpeditionsForUser(
              ProjectService.currentProject().projectId,
              true,
            )
              .then(({ data }) => data.sort(compareValues('expeditionTitle')))
              .catch(() => $state.go('home')),
        },
        params: {
          admin: {
            type: 'bool',
            value: false,
          },
        },
        projectRequired: true,
        loginRequired: true,
      },
    },
    {
      state: 'expeditions.list',
      config: {
        url: '/expeditions',
        component: 'fimsExpeditionsList',
      },
    },
    {
      state: 'expeditions.detail',
      config: {
        url: '/expeditions/:id',
        component: 'fimsExpedition',
        redirectTo: 'expeditions.detail.settings',
        resolve: {
          expedition: /* @ngInject */ ($state, expeditions, $transition$) => {
            const expedition = expeditions.find(
              e => e.expeditionId === $transition$.params().id,
            );

            // need to reload to show correct expedition list when we change project
            // while viewing the expedition detail.
            return (
              expedition || $state.go('expeditions.list', {}, { reload: true })
            );
          },
          backState: () => 'expeditions.list',
        },
        params: {
          id: {
            type: 'int',
          },
        },
      },
    },
    {
      state: 'expeditions.detail.settings',
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
      state: 'expeditions.detail.resources',
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
      state: 'expeditions.detail.members',
      config: {
        url: '/members',
        views: {
          details: {
            template: expeditionMembersTemplate,
            // controller: "ExpeditionMembersController as vm"
          },
        },
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
  routerHelper.redirect('/secure/expeditions.jsp', 'expeditions');
  routerHelper.redirect('/secure/expeditions', 'expeditions');
};

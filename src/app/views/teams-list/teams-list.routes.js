function getStates() {
  return [
    {
      state: 'teams-list',
      config: {
        parent: 'projectView',
        url: '/teams-list',
        component: 'fimsTeamsList',
        projectRequired: false,
      },
    },
  ];
}
export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

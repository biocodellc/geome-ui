function getStates() {
  return [
    {
      state: 'team-overview',
      config: {
        parent: 'projectView',
        url: '/team-overview',
        component: 'fimsTeamOverview',
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

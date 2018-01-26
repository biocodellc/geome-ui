import QueryController from './query.controller';

function getStates() {
  return [
    {
      state: 'query',
      config: {
        url: '/query',
        template: require('./query.html'),
        controller: QueryController,
        controllerA: 'queryVm',
        projectRequired: true,
      },
    },
  ];
}

export default routerHelper => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

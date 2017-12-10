const routing = (routerHelper) => {
  routerHelper.configureStates(getStates());
};

function getStates() {
  return [
    {
      state: 'home',
      config: {
        url: '/',
        template: require('./home.html')
      }
    }
  ];
}

routing.$inject = ['routerHelper'];

export default routing;

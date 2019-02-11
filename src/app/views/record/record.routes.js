function getStates() {
  return [
    {
      state: 'record',
      config: {
        parent: 'containerPageView',
        url: '/record/*bcid',
        component: 'fimsRecord',
        resolve: {
          record: /* @ngInject */ (
            RecordService,
            $stateParams,
            $state,
            $window,
          ) => {
            const { bcid } = $stateParams;
            const re = new RegExp(/^ark:\/\d{5}\/[A-Za-z]+2$/);

            // bcid is a root identifier, so redirect to ezid metadata
            if (re.exec(bcid.trim())) {
              $window.location.href = `https://ezid.cdlib.org/id/${bcid}`;
              return false;
            }
            return RecordService.get(bcid.trim())
              .then(response => {
		// If the response.status is anything other than 200,
		//  it is most likely that the it is  a 403 error (forbidden)
		// or the resource does not exist.  It would be better to trap by 
		// specific status codes, however, i've found that status codes get
		// mangled when exceptions occurr, so in this case, we politely 
		// fail using the 404 route
                if (response.status != 200) {
                    $state.go('notFound', { path: '404' });
		}

                return response.data;
              })
              .catch(() => $state.go('notFound', { path: '404' }));
          },
        },
      },
    },
  ];
}

export default ($transitions, routerHelper) => {
  'ngInject';

  routerHelper.configureStates(getStates());
};

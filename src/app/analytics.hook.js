import { pageChange } from './fims-analytics';

export default ($location, $transitions) => {
  'ngInject';

  $transitions.onSuccess({}, () => {
    pageChange($location.path());
  });
};

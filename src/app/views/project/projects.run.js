import { CACHED_PROJECT_EVENT } from "./index";

export default function run($rootScope, $location, StorageService, Projects) {
  "ngInject";

  let projectId = StorageService.get('projectId');

  if ($location.search()[ 'projectId' ]) {
    projectId = $location.search()[ 'projectId' ];
  }

  if (projectId) {
    Projects.setFromId(projectId).then((p) => {
      $rootScope.$broadcast(CACHED_PROJECT_EVENT, p);
    });
  }
}

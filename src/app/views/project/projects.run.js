export default function run($location, StorageService, ProjectService) {
  "ngInject";

  let projectId = StorageService.get('projectId');

  if ($location.search()[ 'projectId' ]) {
    projectId = $location.search()[ 'projectId' ];
  }

  if (projectId) {
    ProjectService.setFromId(projectId);
  }
}

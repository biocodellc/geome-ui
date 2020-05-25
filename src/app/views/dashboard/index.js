import angular from 'angular';

// import mdDataTable from 'biocode-angular-material-data-table';
// import 'biocode-angular-material-data-table/dist/md-data-table.min.css';
import routing from './dashboard.routes';
import fimsDashboard from './dashboard.component';
import projectsTable from './projects-table/projects-table.component';

export default angular
  .module('fims.dashboard', [])
  .run(routing)
  .component('fimsDashboard', fimsDashboard)
  .component('projectsTable', projectsTable).name;

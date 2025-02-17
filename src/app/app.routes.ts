import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/homepage/homepage.component').then(m => m.HomepageComponent)
    },
    {
        path: 'about',
        loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent)
    },
    {
          path: 'contact',
        loadComponent: () => import('./components/contact-us/contact-us.component').then(m => m.ContactUsComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./components/authentication/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/authentication/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'resetPass',
        loadComponent: () => import('./components/authentication/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    },
    {
        path: 'project/new',
        loadComponent: ()=> import('./components/create-project/create-project.component').then(m => m.CreateProjectComponent)
    },
    {
        path: 'workbench',
        loadComponent: ()=> import('./components/workbench/workbench.component').then(m => m.WorkbenchComponent),
        children:[
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: ()=> import('./components/workbench/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'teams-list',
                loadComponent: ()=> import('./components/workbench/teams-list/teams-list.component').then(m => m.TeamsListComponent)
            },
            {
                path: 'project-overview',
                loadComponent: ()=> import('./components/workbench/project-overview/project-overview.component').then(m => m.ProjectOverviewComponent)
            },
            {
                path: 'team-overview',
                loadComponent: ()=> import('./components/workbench/team-overview/team-overview.component').then(m => m.TeamOverviewComponent)
            },
            {
                path: 'expeditions',
                loadComponent: ()=> import('./components/workbench/expeditions/expeditions.component').then(m => m.ExpeditionsComponent)
            },
            {
                path: 'user/profile',
                loadComponent: ()=> import('./components/workbench/user-profile/user-profile.component').then(m => m.UserProfileComponent)
            }
        ]
    }
];

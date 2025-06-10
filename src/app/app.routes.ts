import { Routes } from '@angular/router';
import { authGuard } from '../helpers/guard/auth.guard';

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
                path: 'expeditions/:id/settings',
                loadComponent: ()=> import('./components/workbench/expeditions-setting/expeditions-setting.component').then(m => m.ExpeditionsSettingComponent)
            },
            {
                path: 'user/profile',
                loadComponent: ()=> import('./components/workbench/user-profile/user-profile.component').then(m => m.UserProfileComponent),
                canActivate: [authGuard]
            },
            {
                path: 'template',
                loadComponent: ()=> import('./components/workbench/template/template.component').then(m => m.TemplateComponent)
            },
            {
                path: 'upload',
                loadComponent: ()=>import('./components/workbench/validation/validation.component').then(m => m.ValidationComponent)
            },
            {
                path: 'upload/photos',
                loadComponent: ()=>import('./components/workbench/upload-photos/upload-photos.component').then(m => m.UploadPhotosComponent)
            },
            {
                path: 'upload/sra',
                loadComponent: ()=>import('./components/workbench/sra-instruction/sra-instruction.component').then(m => m.SraInstructionComponent)
                // loadComponent: ()=>import('./components/workbench/upload-sra/upload-sra.component').then(m => m.UploadSraComponent)
            },
            {
                path: 'plates',
                loadComponent: ()=>import('./components/workbench/plates/plates.component').then(m => m.PlatesComponent)
            },
            {
                path:'project',
                loadComponent: ()=>import('./components/workbench/project/project.component').then(m => m.ProjectComponent),
                children:[
                    { path: '', redirectTo:'settings', pathMatch: 'full' },
                    { path: 'settings', loadComponent: ()=>import('./components/workbench/project/project-setting/project-setting.component').then(m => m.ProjectSettingComponent) },
                    { path: 'expeditions', loadComponent: ()=>import('./components/workbench/project/project-expedition/project-expedition.component').then(m => m.ProjectExpeditionComponent) },
                    { path: 'members', loadComponent: ()=>import('./components/workbench/project/project-members/project-members.component').then(m => m.ProjectMembersComponent) },
                    { path: 'members/add', loadComponent: ()=>import('./components/workbench/project/add-member/add-member.component').then(m => m.AddMemberComponent) },
                ],
                canActivate: [authGuard]
            },
            {
                path: 'config',
                loadComponent: ()=>import('./components/workbench/project-configuration/project-configuration.component').then(m => m.ProjectConfigurationComponent),
                children:[
                    { path: '', redirectTo: 'entities', pathMatch: 'full' },
                    { path: 'entities', loadComponent:()=>import('./components/workbench/project-configuration/entities/entities.component').then(m => m.EntitiesComponent) },
                    { path: 'entities/:entity/:type', loadComponent:()=>import('./components/workbench/project-configuration/entity-details/entity-details.component').then(m => m.EntityDetailsComponent) },
                    { path: 'expedition/properties', loadComponent:()=>import('./components/workbench/project-configuration/expedition-properties/expedition-properties.component').then(m => m.ExpeditionPropertiesComponent) },
                    { path: 'lists', loadComponent:()=>import('./components/workbench/project-configuration/lists/lists.component').then(m => m.ListsComponent) },
                    { path: 'lists/:list', loadComponent:()=>import('./components/workbench/project-configuration/list-details/list-details.component').then(m => m.ListDetailsComponent) },
                    { path: 'settings', loadComponent:()=>import('./components/workbench/project-configuration/settings/settings.component').then(m => m.SettingsComponent) },
                ],
                canActivate: [authGuard]
            }
        ]
    },
    {
        path: 'query',
        loadComponent: ()=> import('./components/query/query.component').then(m => m.QueryComponent)
    },
    {
        path: 'record/ark:/:bcid_1/:bcid_2',
        loadComponent: () => import('./components/record/record.component').then(m => m.RecordComponent)
    }
];

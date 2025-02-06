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
];

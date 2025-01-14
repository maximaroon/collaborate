import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CollaborateComponent } from './pages/collaborate/collaborate.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
    },
    {
        path: 'collaborate',
        component: CollaborateComponent
    },
    {
        path: 'about',
        component: AboutComponent
    }
];

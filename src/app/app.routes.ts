import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'valorant-list',
    pathMatch: 'full',
  },
  {
    path: 'valorant-list',
    loadComponent: () => import('./pages/valorant-list/valorant-list.page').then((m) => m.ValorantListPage),
  },
  {
    path: 'detail/:category/:id',
    loadComponent: () => import('./pages/valorant-detail/valorant-detail.page').then((m) => m.ValorantDetailPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
];

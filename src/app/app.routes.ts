import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './data/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  // Login sin layout
  {
    path: 'login',
    loadComponent: () => import('./presentation/pages/login/login.component').then(m => m.LoginComponent)
  },
  // Zona pública con MainLayout (sidebar + navbar del carrito)
  {
    path: '',
    loadComponent: () => import('./presentation/components/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./presentation/pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./presentation/pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      }
    ]
  },
  // Zona privada con AdminLayout (sin sidebar/navbar del carrito)
  {
    path: 'admin',
    loadComponent: () => import('./presentation/components/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./presentation/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [() => inject(AuthGuard).canActivate()]
      },
      {
        path: 'change-password',
        loadComponent: () => import('./presentation/pages/change-password/change-password.component').then(m => m.ChangePasswordComponent),
        canActivate: [() => inject(AuthGuard).canActivate()]
      }
    ]
  },
  {
    path: 'dashboard',
    redirectTo: 'admin/dashboard'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

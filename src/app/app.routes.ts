import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { AddVendor } from '@features/vendors/add-vendor/add-vendor';
import { VendorSubscriptions } from '@features/subscription/vendor-subscriptions/vendor-subscriptions';

export const routes: Routes = [
  //  LOGIN FIRST
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login').then((m) => m.Login),
  },

  //  ADMIN PANEL (PROTECTED)
  {
    path: '',
    loadComponent: () => import('@core/layout/admin-layout/admin-layout').then((m) => m.AdminLayout),

    /* incomplate role guard  */
    /* canActivate: [authGuard, () => roleGuard(['admin'])], */
    canActivate: [authGuard],

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadComponent: () => import('@features/dashboard/dashboard').then((m) => m.Dashboard),
      },

      {
        path: 'venues',
        loadComponent: () => import('@features/venues/venues').then((m) => m.Venues),
      },

      {
        path: 'users',
        loadComponent: () => import('@features/users/users').then((m) => m.Users),
      },

      {
        path: 'vendors',
        loadComponent: () => import('@features/vendors/vendors').then((m) => m.Vendors),
      },
      {
        path: 'add-vendor',
        loadComponent: () =>
          import('@features/vendors/add-vendor/add-vendor').then((m) => m.AddVendor),
      },

      { path: 'edit-vendor/:id', component: AddVendor },

      /*     {
        path: 'plans/add',
        loadComponent: () =>
          import('@features/subscription/plan-form/plan-form').then((m) => m.PlanForm),
      }, */
      {
        path: 'plans',
        loadComponent: () =>
          import('@features/subscription/plan-list/plan-list').then((m) => m.PlanList),
        runGuardsAndResolvers: 'always', 
      },
      {
        path: 'admin/vendor-subscriptions',
        component: VendorSubscriptions,
      },

      {
        path: 'bookings',
        loadComponent: () => import('@features/bookings/bookings').then((m) => m.Bookings),
      },

      {
        path: 'partners',
        loadComponent: () => import('@features/partners/partners').then(m => m.Partners)
      }

    ],
  },
  //  DEFAULT REDIRECT
  {
    path: '**', // wildcard route  
    redirectTo: 'login',
  },
];

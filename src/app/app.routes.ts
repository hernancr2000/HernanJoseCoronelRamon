import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/products/pages/product-list/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'product/new',
    loadComponent: () => import('./features/products/pages/product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },
  {
    path: 'product/edit/:id',
    loadComponent: () => import('./features/products/pages/product-form/product-form.component')
      .then(m => m.ProductFormComponent)
  },
  { path: '**', redirectTo: '' }
];


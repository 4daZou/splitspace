/**
 * SplitSpace - app-routing.module.ts
 * Defines all client-side routes.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }   from './components/dashboard/dashboard.component';
import { ExpensesComponent }    from './components/expenses/expenses.component';
import { AddExpenseComponent }  from './components/add-expense/add-expense.component';
import { EditExpenseComponent } from './components/edit-expense/edit-expense.component';
import { RoommatesComponent }   from './components/roommates/roommates.component';
import { PaymentsComponent }    from './components/payments/payments.component';

const routes: Routes = [
  { path: '',               redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',      component: DashboardComponent },
  { path: 'expenses',       component: ExpensesComponent },
  { path: 'expenses/new',   component: AddExpenseComponent },
  { path: 'expenses/edit/:id', component: EditExpenseComponent },
  { path: 'roommates',      component: RoommatesComponent },
  { path: 'payments',       component: PaymentsComponent },
  { path: '**',             redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

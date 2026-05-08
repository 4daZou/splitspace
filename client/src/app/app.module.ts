/**
 * SplitSpace - app.module.ts
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent }      from './components/navbar/navbar.component';
import { DashboardComponent }   from './components/dashboard/dashboard.component';
import { ExpensesComponent }    from './components/expenses/expenses.component';
import { AddExpenseComponent }  from './components/add-expense/add-expense.component';
import { EditExpenseComponent } from './components/edit-expense/edit-expense.component';
import { RoommatesComponent }   from './components/roommates/roommates.component';
import { PaymentsComponent }    from './components/payments/payments.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    ExpensesComponent,
    AddExpenseComponent,
    EditExpenseComponent,
    RoommatesComponent,
    PaymentsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

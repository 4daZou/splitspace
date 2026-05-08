import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ExpenseService }  from '../../services/expense.service';
import { RoommateService } from '../../services/roommate.service';
import { PaymentService }  from '../../services/payment.service';
import { Expense, Roommate, Payment, SplitAmount } from '../../interfaces/models';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Your shared expense overview</p>
      </div>

      <div *ngIf="loading" class="loading">Loading...</div>

      <div *ngIf="!loading">
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-label">Total Expenses</div>
            <div class="stat-value">\${{ totalExpenses | number:'1.2-2' }}</div>
          </div>
          <div class="stat-card green">
            <div class="stat-label">Total Paid</div>
            <div class="stat-value">\${{ totalPaid | number:'1.2-2' }}</div>
          </div>
          <div class="stat-card red">
            <div class="stat-label">Total Owed</div>
            <div class="stat-value">\${{ totalUnpaid | number:'1.2-2' }}</div>
          </div>
          <div class="stat-card blue">
            <div class="stat-label">Roommates</div>
            <div class="stat-value">{{ roommates.length }}</div>
          </div>
        </div>

        <section class="section">
          <h2>Roommate Balances</h2>
          <div class="balance-list">
            <div class="balance-row" *ngFor="let r of roommates">
              <div class="avatar">{{ getInitials(r.name) }}</div>
              <div class="name">{{ r.name }}</div>
              <div class="balance" [class.owe]="(r.balance || 0) < 0" [class.owed]="(r.balance || 0) > 0">
                <span *ngIf="(r.balance || 0) < 0">Owes \${{ abs(r.balance || 0) | number:'1.2-2' }}</span>
                <span *ngIf="(r.balance || 0) > 0">Is owed \${{ (r.balance || 0) | number:'1.2-2' }}</span>
                <span *ngIf="(r.balance || 0) === 0" class="settled">Settled ✓</span>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Recent Expenses</h2>
          <div class="expense-list">
            <div class="expense-row" *ngFor="let e of recentExpenses">
              <div class="exp-left">
                <span class="category-badge cat-{{ e.category?.toLowerCase() }}">{{ e.category }}</span>
                <span class="exp-title">{{ e.title }}</span>
              </div>
              <div class="exp-right">
                <span class="exp-amount">\${{ e.amount | number:'1.2-2' }}</span>
                <span class="exp-date">{{ e.createdAt | date:'MMM d' }}</span>
              </div>
            </div>
            <div *ngIf="recentExpenses.length === 0" class="empty">No expenses yet.</div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.75rem; margin: 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0.25rem 0 0; font-size: 0.95rem; }
    .loading { text-align: center; padding: 4rem; color: #888; }

    .stat-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      border-left: 4px solid #6c8cff;
    }
    .stat-card.green { border-left-color: #22c55e; }
    .stat-card.red   { border-left-color: #ef4444; }
    .stat-card.blue  { border-left-color: #3b82f6; }
    .stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #888; }
    .stat-value { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; margin-top: 0.25rem; }

    .section { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); margin-bottom: 1.25rem; }
    .section h2 { margin: 0 0 1rem; font-size: 1rem; color: #1a1a2e; font-weight: 700; }

    .balance-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .balance-row { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: #6c8cff22; color: #6c8cff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }
    .name { flex: 1; font-weight: 500; font-size: 0.95rem; }
    .balance { font-size: 0.9rem; }
    .balance.owe  { color: #ef4444; font-weight: 600; }
    .balance.owed { color: #22c55e; font-weight: 600; }
    .settled { color: #888; }

    .expense-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .expense-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: #f8f9fc; border-radius: 8px; gap: 0.5rem; }
    .exp-left { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
    .exp-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
    .exp-title { font-weight: 500; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .exp-amount { font-weight: 700; color: #1a1a2e; font-size: 0.9rem; }
    .exp-date { color: #888; font-size: 0.8rem; white-space: nowrap; }
    .category-badge { font-size: 0.65rem; padding: 0.15rem 0.5rem; border-radius: 99px; background: #6c8cff22; color: #6c8cff; font-weight: 700; text-transform: uppercase; white-space: nowrap; flex-shrink: 0; }
    .cat-rent { background: #ef444422; color: #ef4444; }
    .cat-groceries { background: #22c55e22; color: #16a34a; }
    .cat-utilities { background: #f59e0b22; color: #d97706; }
    .cat-internet { background: #3b82f622; color: #2563eb; }
    .cat-subscriptions { background: #8b5cf622; color: #7c3aed; }
    .empty { color: #aaa; text-align: center; padding: 1.5rem; font-size: 0.9rem; }

    @media (max-width: 768px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
      .stat-value { font-size: 1.4rem; }
    }
    @media (max-width: 400px) {
      .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
      .stat-card { padding: 1rem 0.85rem; }
      .stat-value { font-size: 1.2rem; }
      .exp-date { display: none; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  expenses: Expense[] = [];
  roommates: Roommate[] = [];
  payments: Payment[] = [];

  get totalExpenses() { return this.expenses.reduce((s, e) => s + e.amount, 0); }
  get totalPaid() {
    return this.expenses.reduce((s, e) =>
      s + (e.splitAmounts || []).filter(sa => sa.isPaid).reduce((a, sa) => a + sa.amount, 0), 0);
  }
  get totalUnpaid() {
    return this.expenses.reduce((s, e) =>
      s + (e.splitAmounts || []).filter(sa => !sa.isPaid).reduce((a, sa) => a + sa.amount, 0), 0);
  }
  get recentExpenses() { return this.expenses.slice(0, 5); }

  abs(n: number) { return Math.abs(n); }
  getInitials(name: string) { return name.split(' ').map(p => p[0]).join('').toUpperCase(); }

  constructor(
    private expenseService: ExpenseService,
    private roommateService: RoommateService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    forkJoin({
      expenses:  this.expenseService.getAll(),
      roommates: this.roommateService.getAll(),
      payments:  this.paymentService.getAll(),
    }).subscribe({
      next: ({ expenses, roommates, payments }) => {
        this.expenses  = expenses;
        this.roommates = roommates;
        this.payments  = payments;
        this.loading   = false;
      },
      error: err => { console.error(err); this.loading = false; }
    });
  }
}

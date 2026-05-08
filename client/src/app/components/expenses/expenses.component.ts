import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { Expense, Roommate, SplitAmount } from '../../interfaces/models';

@Component({
  selector: 'app-expenses',
  template: `
    <div class="expenses-page">
      <div class="page-header">
        <div>
          <h1>Expenses</h1>
          <p class="subtitle">All shared expenses</p>
        </div>
        <a routerLink="/expenses/new" class="btn-primary">+ Add</a>
      </div>

      <div *ngIf="loading" class="loading">Loading expenses...</div>
      <div *ngIf="!loading && expenses.length === 0" class="empty-state">
        <p>No expenses yet. <a routerLink="/expenses/new">Add your first one!</a></p>
      </div>

      <!-- Desktop Table -->
      <div *ngIf="!loading && expenses.length > 0" class="table-wrap">
        <div class="expense-table">
          <div class="table-header">
            <span>Expense</span>
            <span>Amount</span>
            <span class="hide-sm">Paid By</span>
            <span>Split</span>
            <span class="hide-sm">Due Date</span>
            <span>Actions</span>
          </div>
          <div class="table-row" *ngFor="let expense of expenses">
            <div class="exp-info">
              <span class="category-badge cat-{{ expense.category?.toLowerCase() }}">{{ expense.category }}</span>
              <span class="exp-title">{{ expense.title }}</span>
            </div>
            <div class="exp-amount">\${{ expense.amount | number:'1.2-2' }}</div>
            <div class="exp-createdby hide-sm">{{ getCreatedByName(expense) }}</div>
            <div class="exp-split">
              <div class="split-chips">
                <span class="split-chip" *ngFor="let split of expense.splitAmounts"
                      [class.paid]="split.isPaid" [class.unpaid]="!split.isPaid"
                      [title]="getSplitName(split) + ': $' + split.amount">
                  {{ getSplitInitials(split) }} {{ split.isPaid ? '✓' : '·' }}
                </span>
              </div>
            </div>
            <div class="exp-due hide-sm">{{ expense.dueDate ? (expense.dueDate | date:'MMM d') : '—' }}</div>
            <div class="exp-actions">
              <button class="btn-edit" (click)="edit(expense._id!)">Edit</button>
              <button class="btn-delete" (click)="delete(expense._id!)">Del</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div *ngIf="!loading && expenses.length > 0" class="mobile-cards">
        <div class="expense-card" *ngFor="let expense of expenses">
          <div class="card-header">
            <span class="category-badge cat-{{ expense.category?.toLowerCase() }}">{{ expense.category }}</span>
            <span class="card-amount">\${{ expense.amount | number:'1.2-2' }}</span>
          </div>
          <div class="card-title">{{ expense.title }}</div>
          <div class="card-meta">
            <span>By {{ getCreatedByName(expense) }}</span>
            <span *ngIf="expense.dueDate">Due {{ expense.dueDate | date:'MMM d' }}</span>
          </div>
          <div class="split-chips">
            <span class="split-chip" *ngFor="let split of expense.splitAmounts"
                  [class.paid]="split.isPaid" [class.unpaid]="!split.isPaid">
              {{ getSplitInitials(split) }} {{ split.isPaid ? '✓' : '·' }}
            </span>
          </div>
          <div class="card-actions">
            <button class="btn-edit" (click)="edit(expense._id!)">Edit</button>
            <button class="btn-delete" (click)="delete(expense._id!)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.75rem; margin: 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0.25rem 0 0; font-size: 0.9rem; }
    .btn-primary { background: #6c8cff; color: #fff; padding: 0.6rem 1.1rem; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; white-space: nowrap; }
    .loading, .empty-state { text-align: center; padding: 4rem; color: #888; }

    /* Desktop table */
    .table-wrap { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); overflow: hidden; }
    .expense-table { display: block; }
    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr 1fr;
      padding: 0.65rem 1.25rem;
      background: #f8f9fc;
      font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #888;
      border-bottom: 1px solid #eee;
    }
    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr 1fr;
      align-items: center;
      padding: 0.9rem 1.25rem;
      border-bottom: 1px solid #f0f0f0;
    }
    .table-row:hover { background: #fafbff; }
    .exp-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .exp-title { font-weight: 500; color: #1a1a2e; font-size: 0.9rem; }
    .exp-amount { font-weight: 700; font-size: 0.95rem; }
    .exp-due { color: #666; font-size: 0.85rem; }
    .exp-createdby { color: #555; font-size: 0.9rem; }
    .category-badge { font-size: 0.65rem; padding: 0.15rem 0.45rem; border-radius: 99px; font-weight: 700; display: inline-block; text-transform: uppercase; }
    .cat-rent { background: #ef444422; color: #ef4444; }
    .cat-groceries { background: #22c55e22; color: #16a34a; }
    .cat-utilities { background: #f59e0b22; color: #d97706; }
    .cat-internet { background: #3b82f622; color: #2563eb; }
    .cat-subscriptions { background: #8b5cf622; color: #7c3aed; }
    .cat-supplies { background: #6b728022; color: #374151; }
    .cat-other { background: #e5e7eb; color: #6b7280; }
    .split-chips { display: flex; gap: 0.2rem; flex-wrap: wrap; }
    .split-chip { font-size: 0.68rem; padding: 0.12rem 0.35rem; border-radius: 4px; font-weight: 700; }
    .split-chip.paid   { background: #22c55e22; color: #16a34a; }
    .split-chip.unpaid { background: #ef444422; color: #ef4444; }
    .exp-actions { display: flex; gap: 0.4rem; }
    .btn-edit   { background: #6c8cff22; color: #6c8cff; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; }
    .btn-delete { background: #ef444422; color: #ef4444; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.8rem; }
    .btn-edit:hover   { background: #6c8cff; color: #fff; }
    .btn-delete:hover { background: #ef4444; color: #fff; }

    /* Mobile cards - hidden on desktop */
    .mobile-cards { display: none; flex-direction: column; gap: 0.75rem; }
    .expense-card { background: #fff; border-radius: 12px; padding: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
    .card-amount { font-weight: 700; font-size: 1.1rem; color: #1a1a2e; }
    .card-title { font-weight: 600; font-size: 1rem; color: #1a1a2e; margin-bottom: 0.35rem; }
    .card-meta { display: flex; gap: 1rem; font-size: 0.82rem; color: #888; margin-bottom: 0.5rem; }
    .card-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .card-actions .btn-edit, .card-actions .btn-delete { flex: 1; padding: 0.5rem; font-size: 0.85rem; }

    @media (max-width: 768px) {
      .table-wrap { display: none; }
      .mobile-cards { display: flex; }
    }
    @media (max-width: 480px) {
      .hide-sm { display: none; }
    }
  `]
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  loading = true;

  constructor(private expenseService: ExpenseService, private router: Router) {}

  ngOnInit() {
    this.expenseService.getAll().subscribe({
      next: (data) => { this.expenses = data; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  getCreatedByName(expense: Expense): string {
    const cb = expense.createdBy;
    return cb && typeof cb === 'object' ? (cb as Roommate).name : String(cb);
  }
  getSplitName(split: SplitAmount): string {
    const r = split.roommate;
    return r && typeof r === 'object' ? (r as Roommate).name : String(r);
  }
  getSplitInitials(split: SplitAmount): string {
    return this.getSplitName(split).split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }
  edit(id: string) { this.router.navigate(['/expenses/edit', id]); }
  delete(id: string) {
    if (!confirm('Delete this expense?')) return;
    this.expenseService.delete(id).subscribe(() => {
      this.expenses = this.expenses.filter(e => e._id !== id);
    });
  }
}

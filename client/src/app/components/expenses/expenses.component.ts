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
        <a routerLink="/expenses/new" class="btn-primary">+ Add Expense</a>
      </div>

      <div *ngIf="loading" class="loading">Loading expenses...</div>

      <div *ngIf="!loading && expenses.length === 0" class="empty-state">
        <p>No expenses yet. <a routerLink="/expenses/new">Add your first one!</a></p>
      </div>

      <div *ngIf="!loading && expenses.length > 0" class="expense-table">
        <div class="table-header">
          <span>Expense</span>
          <span>Amount</span>
          <span>Paid By</span>
          <span>Split</span>
          <span>Due Date</span>
          <span>Actions</span>
        </div>

        <div class="table-row" *ngFor="let expense of expenses">
          <div class="exp-info">
            <span class="category-badge cat-{{ expense.category?.toLowerCase() }}">{{ expense.category }}</span>
            <span class="exp-title">{{ expense.title }}</span>
            <span class="exp-notes" *ngIf="expense.notes">{{ expense.notes }}</span>
          </div>
          <div class="exp-amount">\${{ expense.amount | number:'1.2-2' }}</div>
          <div class="exp-createdby">{{ getCreatedByName(expense) }}</div>
          <div class="exp-split">
            <div class="split-chips">
              <span class="split-chip" *ngFor="let split of expense.splitAmounts"
                    [class.paid]="split.isPaid" [class.unpaid]="!split.isPaid"
                    [title]="getSplitName(split) + ': $' + split.amount">
                {{ getSplitInitials(split) }} {{ split.isPaid ? '✓' : '·' }}
              </span>
            </div>
          </div>
          <div class="exp-due">{{ expense.dueDate ? (expense.dueDate | date:'MMM d') : '—' }}</div>
          <div class="exp-actions">
            <button class="btn-edit" (click)="edit(expense._id!)">Edit</button>
            <button class="btn-delete" (click)="delete(expense._id!)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; margin: 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0.25rem 0 0; }
    .btn-primary { background: #6c8cff; color: #fff; padding: 0.6rem 1.25rem; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .loading, .empty-state { text-align: center; padding: 4rem; color: #888; }

    .expense-table { background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); overflow: hidden; }
    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr 1fr;
      padding: 0.75rem 1.5rem;
      background: #f8f9fc;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #888;
      border-bottom: 1px solid #eee;
    }
    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr 1fr;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.15s;
    }
    .table-row:hover { background: #fafbff; }
    .exp-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .exp-title { font-weight: 500; color: #1a1a2e; }
    .exp-notes { font-size: 0.8rem; color: #999; }
    .exp-amount { font-weight: 700; font-size: 1.05rem; }
    .exp-due { color: #666; font-size: 0.9rem; }
    .exp-createdby { color: #555; }
    .category-badge { font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 99px; font-weight: 700; display: inline-block; margin-bottom: 0.15rem; }
    .cat-rent { background: #ef444422; color: #ef4444; }
    .cat-groceries { background: #22c55e22; color: #16a34a; }
    .cat-utilities { background: #f59e0b22; color: #d97706; }
    .cat-internet { background: #3b82f622; color: #2563eb; }
    .cat-subscriptions { background: #8b5cf622; color: #7c3aed; }
    .cat-supplies { background: #6b728022; color: #374151; }
    .cat-other { background: #e5e7eb; color: #6b7280; }

    .split-chips { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .split-chip { font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; cursor: default; }
    .split-chip.paid   { background: #22c55e22; color: #16a34a; }
    .split-chip.unpaid { background: #ef444422; color: #ef4444; }

    .exp-actions { display: flex; gap: 0.5rem; }
    .btn-edit   { background: #6c8cff22; color: #6c8cff; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .btn-delete { background: #ef444422; color: #ef4444; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .btn-edit:hover   { background: #6c8cff; color: #fff; }
    .btn-delete:hover { background: #ef4444; color: #fff; }
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
    const name = this.getSplitName(split);
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  edit(id: string) { this.router.navigate(['/expenses/edit', id]); }

  delete(id: string) {
    if (!confirm('Delete this expense?')) return;
    this.expenseService.delete(id).subscribe(() => {
      this.expenses = this.expenses.filter(e => e._id !== id);
    });
  }
}

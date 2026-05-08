import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PaymentService }  from '../../services/payment.service';
import { ExpenseService }  from '../../services/expense.service';
import { RoommateService } from '../../services/roommate.service';
import { Payment, Expense, Roommate } from '../../interfaces/models';

@Component({
  selector: 'app-payments',
  template: `
    <div class="payments-page">
      <div class="page-header">
        <div>
          <h1>Payments</h1>
          <p class="subtitle">Track who has paid what</p>
        </div>
      </div>

      <div *ngIf="loading" class="loading">Loading...</div>

      <div *ngIf="!loading">

        <div class="form-card">
          <h3>Log a Payment</h3>
          <form (ngSubmit)="logPayment()" #payForm="ngForm">
            <div class="form-row">
              <div class="form-group">
                <label>Roommate *</label>
                <select [(ngModel)]="newPayment.roommateId" name="roommateId" required>
                  <option value="">Select roommate</option>
                  <option *ngFor="let r of roommates" [value]="r._id">{{ r.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Expense *</label>
                <select [(ngModel)]="newPayment.expenseId" name="expenseId" required>
                  <option value="">Select expense</option>
                  <option *ngFor="let e of expenses" [value]="e._id">{{ e.title }} ({{ e.amount | currency }})</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Amount Paid *</label>
                <input type="number" [(ngModel)]="newPayment.amountPaid" name="amountPaid" min="0.01" step="0.01" required placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>Date Paid</label>
                <input type="date" [(ngModel)]="newPayment.datePaid" name="datePaid" />
              </div>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <input type="text" [(ngModel)]="newPayment.notes" name="notes" placeholder="e.g. Venmo transfer" />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-submit" [disabled]="payForm.invalid || submitting">
                {{ submitting ? 'Logging...' : 'Log Payment' }}
              </button>
            </div>
          </form>
        </div>

        <section class="history-section">
          <h2>Payment History</h2>
          <div *ngIf="payments.length === 0" class="empty">No payments logged yet.</div>
          <div class="payment-table" *ngIf="payments.length > 0">
            <div class="table-header">
              <span>Roommate</span>
              <span>Expense</span>
              <span>Amount</span>
              <span>Date</span>
              <span>Status</span>
              <span>Notes</span>
            </div>
            <div class="table-row" *ngFor="let p of payments">
              <div class="p-name">{{ getRoommateName(p) }}</div>
              <div class="p-expense">{{ getExpenseTitle(p) }}</div>
              <div class="p-amount">{{ p.amountPaid | currency }}</div>
              <div class="p-date">{{ p.datePaid | date:'MMM d, y' }}</div>
              <div>
                <span class="status-badge status-{{ p.paymentStatus }}">{{ p.paymentStatus }}</span>
              </div>
              <div class="p-notes">{{ p.notes || '-' }}</div>
            </div>
          </div>
        </section>

        <section class="unpaid-section">
          <h2>Outstanding Balances by Expense</h2>
          <div class="expense-breakdown" *ngFor="let e of expenses">
            <div class="expense-label">
              <strong>{{ e.title }}</strong>
              <span class="total">{{ e.amount | currency }}</span>
            </div>
            <div class="split-row" *ngFor="let split of e.splitAmounts">
              <span class="split-name">{{ getSplitName(split.roommate) }}</span>
              <span class="split-amount">{{ split.amount | currency }}</span>
              <span class="split-status" [class.paid]="split.isPaid" [class.unpaid]="!split.isPaid">
                {{ split.isPaid ? 'Paid' : 'Unpaid' }}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; margin: 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0.25rem 0 0; }
    .loading { text-align: center; padding: 4rem; color: #888; }
    .form-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); margin-bottom: 2rem; }
    .form-card h3 { margin: 0 0 1rem; color: #1a1a2e; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .form-group label { font-size: 0.82rem; font-weight: 600; color: #555; }
    .form-group input, .form-group select {
      border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0.6rem 0.85rem;
      font-size: 0.9rem; outline: none; transition: border-color 0.2s;
    }
    .form-group input:focus, .form-group select:focus { border-color: #6c8cff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; }
    .btn-submit { background: #6c8cff; color: #fff; padding: 0.65rem 1.5rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
    .btn-submit:disabled { opacity: 0.6; }
    .history-section, .unpaid-section { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); margin-bottom: 1.5rem; }
    .history-section h2, .unpaid-section h2 { margin: 0 0 1rem; font-size: 1.1rem; color: #1a1a2e; }
    .payment-table { border-radius: 8px; overflow: hidden; border: 1px solid #f0f0f0; }
    .table-header {
      display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1.5fr;
      padding: 0.6rem 1rem; background: #f8f9fc;
      font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #888;
      border-bottom: 1px solid #eee;
    }
    .table-row {
      display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr 1.5fr;
      align-items: center; padding: 0.85rem 1rem; border-bottom: 1px solid #f0f0f0;
    }
    .table-row:last-child { border-bottom: none; }
    .p-name { font-weight: 600; }
    .p-amount { font-weight: 700; }
    .p-date, .p-notes { font-size: 0.88rem; color: #666; }
    .p-expense { font-size: 0.9rem; }
    .status-badge { font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 99px; font-weight: 700; text-transform: capitalize; }
    .status-paid    { background: #22c55e22; color: #16a34a; }
    .status-pending { background: #f59e0b22; color: #d97706; }
    .status-partial { background: #3b82f622; color: #2563eb; }
    .expense-breakdown { border: 1px solid #f0f0f0; border-radius: 8px; margin-bottom: 0.75rem; overflow: hidden; }
    .expense-label { display: flex; justify-content: space-between; padding: 0.75rem 1rem; background: #f8f9fc; font-size: 0.9rem; }
    .total { color: #1a1a2e; font-weight: 700; }
    .split-row { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 1rem; border-top: 1px solid #f5f5f5; }
    .split-name { flex: 1; font-size: 0.9rem; }
    .split-amount { font-weight: 600; font-size: 0.9rem; }
    .split-status { font-size: 0.8rem; font-weight: 700; }
    .split-status.paid   { color: #16a34a; }
    .split-status.unpaid { color: #ef4444; }
    .empty { color: #aaa; text-align: center; padding: 2rem; }
  `]
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  expenses: Expense[] = [];
  roommates: Roommate[] = [];
  loading = true;
  submitting = false;
  newPayment: { roommateId: string; expenseId: string; amountPaid: number | undefined; datePaid: string; notes: string } = {
    roommateId: '', expenseId: '', amountPaid: undefined, datePaid: '', notes: ''
  };

  constructor(
    private paymentService: PaymentService,
    private expenseService: ExpenseService,
    private roommateService: RoommateService
  ) {}

  ngOnInit() {
    forkJoin({
      payments:  this.paymentService.getAll(),
      expenses:  this.expenseService.getAll(),
      roommates: this.roommateService.getAll(),
    }).subscribe({
      next: ({ payments, expenses, roommates }) => {
        this.payments  = payments;
        this.expenses  = expenses;
        this.roommates = roommates;
        this.loading   = false;
      },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  getRoommateName(p: Payment): string {
    const r = p.roommateId;
    return r && typeof r === 'object' ? (r as Roommate).name : String(r);
  }

  getExpenseTitle(p: Payment): string {
    const e = p.expenseId;
    return e && typeof e === 'object' ? (e as Expense).title : String(e);
  }

  getSplitName(r: Roommate | string): string {
    return r && typeof r === 'object' ? (r as Roommate).name : String(r);
  }

  logPayment() {
    if (!this.newPayment.roommateId || !this.newPayment.expenseId || !this.newPayment.amountPaid) return;
    this.submitting = true;
    this.paymentService.create(this.newPayment).subscribe({
      next: (payment) => {
        this.payments = [payment, ...this.payments];
        this.newPayment = { roommateId: '', expenseId: '', amountPaid: undefined, datePaid: '', notes: '' };
        this.submitting = false;
        this.expenseService.getAll().subscribe(data => this.expenses = data);
      },
      error: err => { console.error(err); this.submitting = false; }
    });
  }
}

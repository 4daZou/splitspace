import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService }  from '../../services/expense.service';
import { RoommateService } from '../../services/roommate.service';
import { Expense, Roommate, ExpenseCategory } from '../../interfaces/models';

@Component({
  selector: 'app-edit-expense',
  template: `
    <div class="form-page">
      <div class="page-header">
        <h1>Edit Expense</h1>
        <a routerLink="/expenses" class="btn-back">← Back</a>
      </div>
      <div *ngIf="loading" class="loading">Loading...</div>
      <div class="form-card" *ngIf="!loading">
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" formControlName="title" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select formControlName="category">
                <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Amount ($) *</label>
              <input type="number" formControlName="amount" min="0" step="0.01" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Paid By</label>
              <select formControlName="createdBy">
                <option *ngFor="let r of roommates" [value]="r._id">{{ r.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" formControlName="dueDate" />
            </div>
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea formControlName="notes" rows="3"></textarea>
          </div>
          <div class="form-actions">
            <a routerLink="/expenses" class="btn-cancel">Cancel</a>
            <button type="submit" class="btn-submit" [disabled]="expenseForm.invalid || submitting">
              {{ submitting ? 'Saving...' : 'Update Expense' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 680px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.75rem; margin: 0; color: #1a1a2e; }
    .btn-back { color: #6c8cff; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .loading { text-align: center; padding: 4rem; color: #888; }
    .form-card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
    .form-group label { font-size: 0.82rem; font-weight: 600; color: #555; }
    .form-group input, .form-group select, .form-group textarea {
      border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.85rem;
      font-size: 0.95rem; transition: border-color 0.2s; outline: none; font-family: inherit;
      width: 100%; box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6c8cff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; flex-wrap: wrap; }
    .btn-cancel { padding: 0.65rem 1.1rem; border-radius: 8px; text-decoration: none; color: #666; background: #f3f4f6; font-weight: 600; font-size: 0.9rem; }
    .btn-submit { padding: 0.65rem 1.4rem; border-radius: 8px; background: #6c8cff; color: #fff; border: none; font-weight: 600; font-size: 0.95rem; cursor: pointer; }
    .btn-submit:disabled { opacity: 0.6; }

    @media (max-width: 540px) {
      .form-card { padding: 1.1rem; }
      .form-row { grid-template-columns: 1fr; gap: 0; }
      .form-actions { flex-direction: column-reverse; }
      .btn-cancel, .btn-submit { text-align: center; width: 100%; }
    }
  `]
})
export class EditExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  roommates: Roommate[] = [];
  loading = true;
  submitting = false;
  expenseId!: string;
  categories: ExpenseCategory[] = ['Rent','Utilities','Groceries','Internet','Subscriptions','Supplies','Other'];

  constructor(private fb: FormBuilder, private expenseService: ExpenseService, private roommateService: RoommateService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('id')!;
    this.expenseForm = this.fb.group({
      title:     ['', Validators.required],
      category:  ['Other'],
      amount:    [null, [Validators.required, Validators.min(0.01)]],
      dueDate:   [''],
      createdBy: [''],
      notes:     [''],
    });
    this.roommateService.getAll().subscribe(data => this.roommates = data);
    this.expenseService.getOne(this.expenseId).subscribe({
      next: (expense: Expense) => {
        const dueDate = expense.dueDate ? new Date(expense.dueDate).toISOString().split('T')[0] : '';
        const createdById = expense.createdBy && typeof expense.createdBy === 'object'
          ? (expense.createdBy as Roommate)._id : expense.createdBy;
        this.expenseForm.patchValue({ title: expense.title, category: expense.category, amount: expense.amount, dueDate, createdBy: createdById, notes: expense.notes || '' });
        this.loading = false;
      },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  onSubmit() {
    if (this.expenseForm.invalid) return;
    this.submitting = true;
    this.expenseService.update(this.expenseId, this.expenseForm.value).subscribe({
      next: () => this.router.navigate(['/expenses']),
      error: (err) => { console.error(err); this.submitting = false; }
    });
  }
}

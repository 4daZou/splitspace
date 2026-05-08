import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService }  from '../../services/expense.service';
import { RoommateService } from '../../services/roommate.service';
import { Roommate, ExpenseCategory } from '../../interfaces/models';

@Component({
  selector: 'app-add-expense',
  template: `
    <div class="form-page">
      <div class="page-header">
        <h1>Add Expense</h1>
        <a routerLink="/expenses" class="btn-back">← Back</a>
      </div>

      <div class="form-card">
        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()">

          <div class="form-group">
            <label>Title *</label>
            <input type="text" formControlName="title" placeholder="e.g. April Rent" />
            <span class="error" *ngIf="f['title'].touched && f['title'].invalid">Title is required</span>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Category *</label>
              <select formControlName="category">
                <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Amount ($) *</label>
              <input type="number" formControlName="amount" placeholder="0.00" min="0" step="0.01" />
              <span class="error" *ngIf="f['amount'].touched && f['amount'].invalid">Valid amount required</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Paid By *</label>
              <select formControlName="createdBy">
                <option value="">Select roommate</option>
                <option *ngFor="let r of roommates" [value]="r._id">{{ r.name }}</option>
              </select>
              <span class="error" *ngIf="f['createdBy'].touched && f['createdBy'].invalid">Required</span>
            </div>
            <div class="form-group">
              <label>Due Date</label>
              <input type="date" formControlName="dueDate" />
            </div>
          </div>

          <div class="form-group">
            <label>Split Between</label>
            <div class="checkbox-group">
              <label class="checkbox-item" *ngFor="let r of roommates">
                <input type="checkbox" [value]="r._id"
                       (change)="onSplitChange($event, r._id!)"
                       [checked]="selectedRoommates.includes(r._id!)" />
                {{ r.name }}
              </label>
            </div>
            <div class="split-preview" *ngIf="splitPreview > 0">
              Each person owes: <strong>\${{ splitPreview | number:'1.2-2' }}</strong>
            </div>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea formControlName="notes" rows="3" placeholder="Optional notes..."></textarea>
          </div>

          <div class="form-actions">
            <a routerLink="/expenses" class="btn-cancel">Cancel</a>
            <button type="submit" class="btn-submit" [disabled]="expenseForm.invalid || submitting">
              {{ submitting ? 'Saving...' : 'Add Expense' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { max-width: 680px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; margin: 0; color: #1a1a2e; }
    .btn-back { color: #6c8cff; text-decoration: none; font-weight: 600; }

    .form-card { background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #555; }
    .form-group input, .form-group select, .form-group textarea {
      border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0.65rem 0.9rem;
      font-size: 0.95rem; transition: border-color 0.2s; outline: none;
      font-family: inherit;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6c8cff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .error { color: #ef4444; font-size: 0.78rem; }

    .checkbox-group { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.25rem; }
    .checkbox-item { display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-size: 0.9rem; }
    .checkbox-item input { width: 16px; height: 16px; accent-color: #6c8cff; }

    .split-preview { margin-top: 0.5rem; font-size: 0.9rem; color: #555; background: #6c8cff0d; padding: 0.5rem 0.75rem; border-radius: 6px; }

    .form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
    .btn-cancel { padding: 0.65rem 1.25rem; border-radius: 8px; text-decoration: none; color: #666; background: #f3f4f6; font-weight: 600; }
    .btn-submit { padding: 0.65rem 1.5rem; border-radius: 8px; background: #6c8cff; color: #fff; border: none; font-weight: 600; font-size: 1rem; cursor: pointer; }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class AddExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  roommates: Roommate[] = [];
  selectedRoommates: string[] = [];
  submitting = false;

  categories: ExpenseCategory[] = ['Rent','Utilities','Groceries','Internet','Subscriptions','Supplies','Other'];

  get f() { return this.expenseForm.controls; }

  get splitPreview(): number {
    const amount = this.expenseForm.get('amount')?.value || 0;
    const count = this.selectedRoommates.length;
    return count > 0 ? parseFloat((amount / count).toFixed(2)) : 0;
  }

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private roommateService: RoommateService,
    private router: Router
  ) {}

  ngOnInit() {
    this.expenseForm = this.fb.group({
      title:     ['', Validators.required],
      category:  ['Other', Validators.required],
      amount:    [null, [Validators.required, Validators.min(0.01)]],
      dueDate:   [''],
      createdBy: ['', Validators.required],
      notes:     [''],
    });

    this.roommateService.getAll().subscribe(data => {
      this.roommates = data;
      this.selectedRoommates = data.map(r => r._id!);
    });
  }

  onSplitChange(event: Event, id: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedRoommates = [...this.selectedRoommates, id];
    } else {
      this.selectedRoommates = this.selectedRoommates.filter(rid => rid !== id);
    }
  }

  onSubmit() {
    if (this.expenseForm.invalid) return;
    this.submitting = true;

    const payload = {
      ...this.expenseForm.value,
      splitBetween: this.selectedRoommates,
    };

    this.expenseService.create(payload).subscribe({
      next: () => this.router.navigate(['/expenses']),
      error: (err) => { console.error(err); this.submitting = false; }
    });
  }
}

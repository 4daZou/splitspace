import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RoommateService } from '../../services/roommate.service';
import { Roommate } from '../../interfaces/models';

@Component({
  selector: 'app-roommates',
  template: `
    <div class="roommates-page">
      <div class="page-header">
        <div>
          <h1>Roommates</h1>
          <p class="subtitle">Manage your household members</p>
        </div>
        <button class="btn-primary" (click)="showAddForm = !showAddForm">
          {{ showAddForm ? '✕ Cancel' : '+ Add' }}
        </button>
      </div>

      <div class="form-card" *ngIf="showAddForm">
        <h3>New Roommate</h3>
        <form #addForm="ngForm" (ngSubmit)="onCreate(addForm)">
          <div class="form-row">
            <div class="form-group">
              <label>Name *</label>
              <input name="name" ngModel required placeholder="Full name" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input name="email" ngModel type="email" placeholder="email@example.com" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Phone</label>
              <input name="phone" ngModel placeholder="555-0100" />
            </div>
            <div class="form-group">
              <label>Move-In Date</label>
              <input name="moveInDate" ngModel type="date" class="date-input" />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-submit" [disabled]="addForm.invalid || submitting">
              {{ submitting ? 'Adding...' : 'Add Roommate' }}
            </button>
          </div>
        </form>
      </div>

      <div *ngIf="loading" class="loading">Loading roommates...</div>

      <div class="roommate-grid" *ngIf="!loading">
        <div class="roommate-card" *ngFor="let r of roommates">
          <ng-container *ngIf="editingId !== r._id">
            <div class="card-top">
              <div class="avatar-lg">{{ getInitials(r.name) }}</div>
              <div class="info">
                <h3>{{ r.name }}</h3>
                <p *ngIf="r.email">📧 {{ r.email }}</p>
                <p *ngIf="r.phone">📱 {{ r.phone }}</p>
                <p *ngIf="r.moveInDate">🏠 Moved in {{ r.moveInDate | date:'MMM y' }}</p>
              </div>
            </div>
            <div class="card-balance" [class.negative]="(r.balance||0) < 0" [class.positive]="(r.balance||0) > 0">
              <span *ngIf="(r.balance||0) < 0">Owes \${{ abs(r.balance||0) | number:'1.2-2' }}</span>
              <span *ngIf="(r.balance||0) > 0">Is owed \${{ (r.balance||0) | number:'1.2-2' }}</span>
              <span *ngIf="(r.balance||0) === 0">Balanced ✓</span>
            </div>
            <div class="card-actions">
              <button class="btn-edit" (click)="startEdit(r)">Edit</button>
              <button class="btn-delete" (click)="onDelete(r._id!)">Delete</button>
            </div>
          </ng-container>

          <ng-container *ngIf="editingId === r._id">
            <form #editForm="ngForm" (ngSubmit)="onUpdate(r._id!, editForm)">
              <div class="form-group">
                <label>Name</label>
                <input name="name" [ngModel]="editData.name" required />
              </div>
              <div class="form-group">
                <label>Email</label>
                <input name="email" [ngModel]="editData.email" type="email" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input name="phone" [ngModel]="editData.phone" />
              </div>
              <div class="card-actions">
                <button type="submit" class="btn-submit-sm">Save</button>
                <button type="button" class="btn-cancel-sm" (click)="editingId = null">Cancel</button>
              </div>
            </form>
          </ng-container>
        </div>
        <div *ngIf="roommates.length === 0" class="empty">No roommates yet. Add one above!</div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.75rem; margin: 0; color: #1a1a2e; }
    .subtitle { color: #666; margin: 0.25rem 0 0; font-size: 0.9rem; }
    .btn-primary { background: #6c8cff; color: #fff; padding: 0.6rem 1.1rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 0.9rem; white-space: nowrap; }
    .loading { text-align: center; padding: 4rem; color: #888; }
    .form-card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); margin-bottom: 1.5rem; }
    .form-card h3 { margin: 0 0 1rem; color: #1a1a2e; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.9rem; }
    .form-group label { font-size: 0.82rem; font-weight: 600; color: #555; }
    .form-group input {
      border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0.6rem 0.85rem;
      font-size: 0.9rem; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box;
    }
    .form-group input:focus { border-color: #6c8cff; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions { display: flex; justify-content: flex-end; }
    .btn-submit { background: #6c8cff; color: #fff; padding: 0.6rem 1.25rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
    .btn-submit:disabled { opacity: 0.6; }
    .btn-submit-sm { background: #6c8cff; color: #fff; padding: 0.45rem 0.9rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .btn-cancel-sm { background: #f3f4f6; color: #555; padding: 0.45rem 0.9rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .roommate-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .roommate-card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
    .card-top { display: flex; gap: 0.9rem; margin-bottom: 0.9rem; }
    .avatar-lg { width: 48px; height: 48px; border-radius: 50%; background: #6c8cff22; color: #6c8cff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
    .info h3 { margin: 0 0 0.25rem; color: #1a1a2e; font-size: 1rem; }
    .info p { margin: 0.1rem 0; font-size: 0.82rem; color: #666; }
    .card-balance { font-weight: 700; font-size: 0.88rem; padding: 0.45rem 0.75rem; border-radius: 8px; margin-bottom: 0.9rem; background: #f3f4f6; text-align: center; color: #555; }
    .card-balance.negative { background: #ef444411; color: #ef4444; }
    .card-balance.positive { background: #22c55e11; color: #16a34a; }
    .card-actions { display: flex; gap: 0.5rem; }
    .btn-edit   { flex: 1; background: #6c8cff22; color: #6c8cff; border: none; padding: 0.45rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .btn-delete { flex: 1; background: #ef444422; color: #ef4444; border: none; padding: 0.45rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .btn-edit:hover   { background: #6c8cff; color: #fff; }
    .btn-delete:hover { background: #ef4444; color: #fff; }
    .empty { color: #aaa; text-align: center; padding: 2rem; grid-column: 1/-1; }
    .date-input { border: 1.5px solid #e5e7eb; border-radius: 8px; padding: 0.6rem 0.85rem; font-size: 0.9rem; outline: none; font-family: inherit; color: #1a1a2e; cursor: pointer; width: 100%; box-sizing: border-box; transition: border-color 0.2s; }
    .date-input:focus { border-color: #6c8cff; }
    .date-input::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; filter: invert(40%) sepia(100%) saturate(500%) hue-rotate(200deg); }

    @media (max-width: 540px) {
      .form-row { grid-template-columns: 1fr; gap: 0; }
      .roommate-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RoommatesComponent implements OnInit {
  roommates: Roommate[] = [];
  loading = true;
  showAddForm = false;
  submitting = false;
  editingId: string | null = null;
  editData: Partial<Roommate> = {};

  constructor(private roommateService: RoommateService) {}

  ngOnInit() { this.loadRoommates(); }

  loadRoommates() {
    this.roommateService.getAll().subscribe({
      next: data => { this.roommates = data; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  getInitials(name: string) { return name.split(' ').map(p => p[0]).join('').toUpperCase(); }
  abs(n: number) { return Math.abs(n); }

  onCreate(form: NgForm) {
    if (form.invalid) return;
    this.submitting = true;
    this.roommateService.create(form.value).subscribe({
      next: (r) => { this.roommates = [...this.roommates, r]; this.showAddForm = false; form.reset(); this.submitting = false; },
      error: (err) => { console.error(err); this.submitting = false; }
    });
  }

  startEdit(r: Roommate) { this.editingId = r._id!; this.editData = { name: r.name, email: r.email, phone: r.phone }; }

  onUpdate(id: string, form: NgForm) {
    this.roommateService.update(id, form.value).subscribe({
      next: (updated) => { this.roommates = this.roommates.map(r => r._id === id ? updated : r); this.editingId = null; },
      error: err => console.error(err)
    });
  }

  onDelete(id: string) {
    if (!confirm('Remove this roommate?')) return;
    this.roommateService.delete(id).subscribe(() => { this.roommates = this.roommates.filter(r => r._id !== id); });
  }
}

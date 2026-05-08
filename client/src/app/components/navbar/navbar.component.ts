import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">🏠</span>
        <span class="brand-name">SplitSpace</span>
      </div>
      <ul class="nav-links">
        <li><a routerLink="/dashboard"  routerLinkActive="active">Dashboard</a></li>
        <li><a routerLink="/expenses"   routerLinkActive="active">Expenses</a></li>
        <li><a routerLink="/roommates"  routerLinkActive="active">Roommates</a></li>
        <li><a routerLink="/payments"   routerLinkActive="active">Payments</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1a1a2e;
      padding: 0 2rem;
      height: 64px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.4rem;
      font-weight: 700;
      color: #fff;
      text-decoration: none;
    }
    .brand-icon { font-size: 1.5rem; }
    .brand-name { color: #6c8cff; }
    .nav-links {
      display: flex;
      list-style: none;
      margin: 0; padding: 0;
      gap: 0.25rem;
    }
    .nav-links a {
      display: block;
      padding: 0.5rem 1rem;
      color: #ccc;
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: background 0.2s, color 0.2s;
    }
    .nav-links a:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .nav-links a.active { background: #6c8cff22; color: #6c8cff; font-weight: 600; }
  `]
})
export class NavbarComponent {}

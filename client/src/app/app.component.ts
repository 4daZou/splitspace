import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem 0.75rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'SplitSpace';
}

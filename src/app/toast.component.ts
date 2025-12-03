import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="toast" [ngClass]="type">
      {{ message }}
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 18px;
      border-radius: 8px;
      color: white;
      font-size: 15px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
      animation: fadeIn 0.3s ease-out;
      z-index: 9999;
    }
    .success { background: #4caf50; }
    .error { background: #e53935; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ToastComponent {
  @Input() show = false;
  @Input() message = '';
  @Input() type: 'success' | 'error' = 'success';
}

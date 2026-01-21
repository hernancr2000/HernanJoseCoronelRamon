import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notification = signal<Notification | null>(null);

  readonly notification = this._notification.asReadonly();

  show(message: string, type: 'success' | 'error' = 'success'): void {
    this._notification.set({ message, type });

    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      this.clear();
    }, 3000);
  }

  clear(): void {
    this._notification.set(null);
  }
}

import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { vi } from 'vitest';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success notification', () => {
    service.show('Producto creado', 'success');

    expect(service.notification()).toEqual({
      message: 'Producto creado',
      type: 'success'
    });
  });

  it('should show error notification', () => {
    service.show('Error al crear', 'error');

    expect(service.notification()).toEqual({
      message: 'Error al crear',
      type: 'error'
    });
  });

  it('should clear notification', () => {
    service.show('Test message', 'success');
    service.clear();

    expect(service.notification()).toBeNull();
  });

  it('should auto-clear after 3 seconds', () => {
    service.show('Auto clear test', 'success');

    expect(service.notification()).not.toBeNull();

    vi.advanceTimersByTime(3000);

    expect(service.notification()).toBeNull();
  });

  it('should default to success type', () => {
    service.show('Default type');

    expect(service.notification()?.type).toBe('success');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { NotificationService } from '@shared/services/notification.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display toast when no notification', () => {
    const toastElement = fixture.nativeElement.querySelector('.toast');
    expect(toastElement).toBeNull();
  });

  it('should display success toast when notification exists', () => {
    notificationService.show('Success message', 'success');
    fixture.detectChanges();

    const toastElement = fixture.nativeElement.querySelector('.toast');
    expect(toastElement).toBeTruthy();
    expect(toastElement.classList.contains('success')).toBe(true);
    expect(toastElement.textContent).toContain('Success message');
  });

  it('should display error toast when error notification', () => {
    notificationService.show('Error message', 'error');
    fixture.detectChanges();

    const toastElement = fixture.nativeElement.querySelector('.toast');
    expect(toastElement).toBeTruthy();
    expect(toastElement.classList.contains('error')).toBe(true);
  });

  it('should clear notification when close button clicked', () => {
    notificationService.show('Test message', 'success');
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.toast-close');
    closeBtn.click();
    fixture.detectChanges();

    expect(notificationService.notification()).toBeNull();
    const toastElement = fixture.nativeElement.querySelector('.toast');
    expect(toastElement).toBeNull();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [ConfirmModalComponent],
  template: `
    <app-confirm-modal
      [message]="message"
      [isLoading]="isLoading"
      (confirm)="onConfirm()"
      (cancel)="onCancel()"
    />
  `
})
class TestHostComponent {
  message = '¿Estás seguro de eliminar este producto?';
  isLoading = false;
  confirmed = false;
  cancelled = false;

  onConfirm() { this.confirmed = true; }
  onCancel() { this.cancelled = true; }
}

// Host separado para el test de loading
@Component({
  standalone: true,
  imports: [ConfirmModalComponent],
  template: `
    <app-confirm-modal
      [message]="'Eliminando...'"
      [isLoading]="true"
      (confirm)="onConfirm()"
      (cancel)="onCancel()"
    />
  `
})
class TestHostLoadingComponent {
  onConfirm() {}
  onCancel() {}
}

describe('ConfirmModalComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TestHostLoadingComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it('should create', () => {
    const modalElement = hostFixture.nativeElement.querySelector('app-confirm-modal');
    expect(modalElement).toBeTruthy();
  });

  it('should display the message', () => {
    const messageElement = hostFixture.nativeElement.querySelector('.modal-message');
    expect(messageElement.textContent).toContain('¿Estás seguro de eliminar este producto?');
  });

  it('should emit confirm when confirm button is clicked', () => {
    const confirmBtn = hostFixture.nativeElement.querySelector('.btn-primary');
    confirmBtn.click();
    expect(hostComponent.confirmed).toBe(true);
  });

  it('should emit cancel when cancel button is clicked', () => {
    const cancelBtn = hostFixture.nativeElement.querySelector('.btn-secondary');
    cancelBtn.click();
    expect(hostComponent.cancelled).toBe(true);
  });

  it('should show loading state', () => {
    const loadingFixture = TestBed.createComponent(TestHostLoadingComponent);
    loadingFixture.detectChanges();

    const confirmBtn = loadingFixture.nativeElement.querySelector('.btn-primary');
    expect(confirmBtn.textContent).toContain('Eliminando...');
    expect(confirmBtn.disabled).toBe(true);
  });
});

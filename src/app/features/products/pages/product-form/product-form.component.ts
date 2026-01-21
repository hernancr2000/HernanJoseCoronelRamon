import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  // Estado
  isEditMode = signal<boolean>(false);
  productId = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  isValidatingId = signal<boolean>(false);

  // Formulario
  productForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
    this.setupDateRevisionAutoCalc();
  }

  private initForm(): void {

    this.productForm = this.fb.group({
      id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
      name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      logo: ['', [Validators.required]],
      date_release: ['', [Validators.required, this.dateMinTodayValidator()]],
      date_revision: [{ value: '', disabled: true }, [Validators.required]],
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);

    this.productService.getProducts().subscribe({
      next: (products) => {
        const product = products.find((p) => p.id === id);
        if (product) {
          this.productForm.patchValue({
            id: product.id,
            name: product.name,
            description: product.description,
            logo: product.logo,
            date_release: product.date_release,
            date_revision: product.date_revision,
          });
          // Deshabilitar ID en modo edición
          this.productForm.get('id')?.disable();
        } else {
          this.notificationService.show('Producto no encontrado.', 'error');
          this.router.navigate(['/']);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.show('Error al cargar el producto.', 'error');
        this.router.navigate(['/']);
        this.isLoading.set(false);
      },
    });
  }

  private setupDateRevisionAutoCalc(): void {
    this.productForm.get('date_release')?.valueChanges.subscribe((date) => {
      if (date) {
        const releaseDate = new Date(date);
        const revisionDate = new Date(releaseDate);
        revisionDate.setFullYear(revisionDate.getFullYear() + 1);

        const formattedDate = revisionDate.toISOString().split('T')[0];
        this.productForm.get('date_revision')?.setValue(formattedDate);
      }
    });
  }

  // Validador personalizado: fecha >= hoy
  private dateMinTodayValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const [year, month, day] = control.value.split('-').map(Number);
      const inputDate = new Date(year, month - 1, day);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (inputDate < today) {
        return { dateMinToday: true };
      }
      return null;
    };
  }

  // Validar ID único al perder foco
  onIdBlur(): void {
    const idControl = this.productForm.get('id');
    if (idControl?.valid && !this.isEditMode()) {
      this.isValidatingId.set(true);

      this.productService.verifyProductId(idControl.value).subscribe({
        next: (exists) => {
          if (exists) {
            idControl.setErrors({ idExists: true });
          }
          this.isValidatingId.set(false);
        },
        error: () => {
          this.isValidatingId.set(false);
        },
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    // Obtener valores incluyendo campos deshabilitados
    const formValue = this.productForm.getRawValue();

    const product: Product = {
      id: formValue.id,
      name: formValue.name,
      description: formValue.description,
      logo: formValue.logo,
      date_release: formValue.date_release,
      date_revision: formValue.date_revision,
    };

    if (this.isEditMode()) {
      this.updateProduct(product);
    } else {
      this.createProduct(product);
    }
  }

  private createProduct(product: Product): void {
    this.productService.createProduct(product).subscribe({
      next: () => {
        this.notificationService.show('Producto creado con éxito!', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.notificationService.show('Error al crear el producto.', 'error');
        this.isSubmitting.set(false);
      },
    });
  }

  private updateProduct(product: Product): void {
    const { id, ...productData } = product;

    this.productService.updateProduct(id, productData).subscribe({
      next: () => {
        this.notificationService.show('Producto actualizado con éxito!', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        this.notificationService.show('Error al actualizar el producto.', 'error');
        this.isSubmitting.set(false);
      },
    });
  }

  onReset(): void {
    if (this.isEditMode()) {
      this.loadProduct(this.productId()!);
    } else {
      this.productForm.reset();
    }
  }

  private markAllAsTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  // Helpers para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);

    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido!';
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `Mínimo ${minLength} caracteres!`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `Máximo ${maxLength} caracteres!`;
      }
      if (field.errors['dateMinToday']) return 'La fecha debe ser igual o mayor a hoy!';
      if (field.errors['idExists']) return 'ID no válido!';
    }

    return '';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

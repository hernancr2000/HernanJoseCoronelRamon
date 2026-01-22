import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { vi } from 'vitest';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockProduct = {
    id: 'prod-1',
    name: 'Producto Test',
    description: 'Descripción del producto test',
    logo: 'https://example.com/logo.png',
    date_release: '2026-01-21',
    date_revision: '2027-01-21'
  };

  // Helper para crear el componente con diferentes configs de ActivatedRoute
  const createComponent = async (paramId: string | null = null) => {
    await TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => paramId
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  };

  afterEach(() => {
    httpMock.verify();
  });

  describe('Create Mode', () => {
    beforeEach(async () => {
      await createComponent(null);
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should be in create mode by default', () => {
      expect(component.isEditMode()).toBe(false);
    });

    it('should have empty form initially', () => {
      expect(component.productForm.get('id')?.value).toBe('');
      expect(component.productForm.get('name')?.value).toBe('');
    });

    it('should validate required fields', () => {
      component.onSubmit();

      expect(component.productForm.get('id')?.hasError('required')).toBe(true);
      expect(component.productForm.get('name')?.hasError('required')).toBe(true);
      expect(component.productForm.get('description')?.hasError('required')).toBe(true);
      expect(component.productForm.get('logo')?.hasError('required')).toBe(true);
      expect(component.productForm.get('date_release')?.hasError('required')).toBe(true);
    });

    it('should validate id min length', () => {
      component.productForm.get('id')?.setValue('ab');
      expect(component.productForm.get('id')?.hasError('minlength')).toBe(true);
    });

    it('should validate id max length', () => {
      component.productForm.get('id')?.setValue('12345678901');
      expect(component.productForm.get('id')?.hasError('maxlength')).toBe(true);
    });

    it('should validate name min length', () => {
      component.productForm.get('name')?.setValue('abcd');
      expect(component.productForm.get('name')?.hasError('minlength')).toBe(true);
    });

    it('should validate name max length', () => {
      component.productForm.get('name')?.setValue('a'.repeat(101));
      expect(component.productForm.get('name')?.hasError('maxlength')).toBe(true);
    });

    it('should validate description min length', () => {
      component.productForm.get('description')?.setValue('123456789');
      expect(component.productForm.get('description')?.hasError('minlength')).toBe(true);
    });

    it('should validate description max length', () => {
      component.productForm.get('description')?.setValue('a'.repeat(201));
      expect(component.productForm.get('description')?.hasError('maxlength')).toBe(true);
    });

    it('should auto-calculate date_revision when date_release changes', () => {
      component.productForm.get('date_release')?.setValue('2026-01-21');
      expect(component.productForm.get('date_revision')?.value).toBe('2027-01-21');
    });

    it('should validate date_release is not in the past', () => {
      component.productForm.get('date_release')?.setValue('2020-01-01');
      expect(component.productForm.get('date_release')?.hasError('dateMinToday')).toBe(true);
    });

    it('should reset form on reset click', () => {
      component.productForm.get('name')?.setValue('Test Product');
      component.onReset();
      expect(component.productForm.get('name')?.value).toBeFalsy();
    });

    it('should navigate back on goBack', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.goBack();
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should verify product id on blur', () => {
      component.productForm.get('id')?.setValue('test-id');
      component.onIdBlur();

      const req = httpMock.expectOne('http://localhost:3002/bp/products/verification/test-id');
      expect(req.request.method).toBe('GET');
      req.flush(false);

      expect(component.isValidatingId()).toBe(false);
    });

    it('should set error if id already exists', () => {
      component.productForm.get('id')?.setValue('exist-id');
      component.onIdBlur();

      const req = httpMock.expectOne('http://localhost:3002/bp/products/verification/exist-id');
      req.flush(true);

      expect(component.productForm.get('id')?.hasError('idExists')).toBe(true);
    });

    it('should create product on valid submit', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.productForm.patchValue({
        id: 'new-prod',
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        logo: 'https://example.com/logo.png',
        date_release: '2026-06-01'
      });

      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:3002/bp/products');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Product added successfully', data: mockProduct });

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should handle error on create', () => {
      component.productForm.patchValue({
        id: 'new-prod',
        name: 'Nuevo Producto',
        description: 'Descripción del nuevo producto',
        logo: 'https://example.com/logo.png',
        date_release: '2026-06-01'
      });

      component.onSubmit();

      const req = httpMock.expectOne('http://localhost:3002/bp/products');
      req.flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });

      expect(component.isSubmitting()).toBe(false);
    });

    it('should return correct error messages', () => {
      component.productForm.get('id')?.setErrors({ required: true });
      component.productForm.get('id')?.markAsTouched();
      expect(component.getFieldError('id')).toBe('Este campo es requerido!');

      component.productForm.get('id')?.setErrors({ minlength: { requiredLength: 3 } });
      expect(component.getFieldError('id')).toBe('Mínimo 3 caracteres!');

      component.productForm.get('id')?.setErrors({ maxlength: { requiredLength: 10 } });
      expect(component.getFieldError('id')).toBe('Máximo 10 caracteres!');

      component.productForm.get('id')?.setErrors({ idExists: true });
      expect(component.getFieldError('id')).toBe('ID no válido!');

      component.productForm.get('date_release')?.setErrors({ dateMinToday: true });
      expect(component.getFieldError('date_release')).toBe('La fecha debe ser igual o mayor a hoy!');
    });

    it('should check if field is invalid', () => {
      component.productForm.get('id')?.setErrors({ required: true });
      component.productForm.get('id')?.markAsTouched();
      expect(component.isFieldInvalid('id')).toBe(true);

      component.productForm.get('name')?.markAsTouched();
      component.productForm.get('name')?.setErrors(null);
      expect(component.isFieldInvalid('name')).toBe(false);
    });
  });

  describe('Edit Mode', () => {
    beforeEach(async () => {
      await createComponent('prod-1');
    });

    it('should be in edit mode when id param exists', () => {
      const req = httpMock.expectOne('http://localhost:3002/bp/products');
      req.flush({ data: [mockProduct] });

      expect(component.isEditMode()).toBe(true);
      expect(component.productId()).toBe('prod-1');
    });

    it('should load product data in edit mode', () => {
      const req = httpMock.expectOne('http://localhost:3002/bp/products');
      req.flush({ data: [mockProduct] });

      expect(component.productForm.get('id')?.value).toBe('prod-1');
      expect(component.productForm.get('name')?.value).toBe('Producto Test');
      expect(component.productForm.get('id')?.disabled).toBe(true);
    });

    it('should navigate to home if product not found', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      const req = httpMock.expectOne('http://localhost:3002/bp/products');
      req.flush({ data: [] });

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should update product on valid submit in edit mode', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      const req = httpMock.expectOne('http://localhost:3002/bp/products');
      req.flush({ data: [mockProduct] });

      component.productForm.get('name')?.setValue('Producto Actualizado');
      component.onSubmit();

      const updateReq = httpMock.expectOne('http://localhost:3002/bp/products/prod-1');
      expect(updateReq.request.method).toBe('PUT');
      updateReq.flush({ message: 'Product updated successfully', data: mockProduct });

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('should handle error on update', () => {
      const req = httpMock.expectOne('http://localhost:3002/bp/products');
      req.flush({ data: [mockProduct] });

      component.onSubmit();

      const updateReq = httpMock.expectOne('http://localhost:3002/bp/products/prod-1');
      updateReq.flush({ message: 'Error' }, { status: 400, statusText: 'Bad Request' });

      expect(component.isSubmitting()).toBe(false);
    });

    it('should reload product data on reset in edit mode', () => {
      const req = httpMock.expectOne('http://localhost:3002/bp/products');
      req.flush({ data: [mockProduct] });

      component.productForm.get('name')?.setValue('Changed Name');
      component.onReset();

      const reloadReq = httpMock.expectOne('http://localhost:3002/bp/products');
      reloadReq.flush({ data: [mockProduct] });

      expect(component.productForm.get('name')?.value).toBe('Producto Test');
    });
  });
});

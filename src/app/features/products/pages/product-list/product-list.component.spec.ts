import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { Product } from '@core/models/product.model';
import { vi } from 'vitest';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      name: 'Producto Uno',
      description: 'Descripción del producto uno',
      logo: 'https://example.com/logo1.png',
      date_release: '2026-01-21',
      date_revision: '2027-01-21',
    },
    {
      id: 'prod-2',
      name: 'Producto Dos',
      description: 'Descripción del producto dos',
      logo: 'https://example.com/logo2.png',
      date_release: '2026-02-15',
      date_revision: '2027-02-15',
    },
    {
      id: 'prod-3',
      name: 'Otro Item',
      description: 'Descripción diferente',
      logo: 'https://example.com/logo3.png',
      date_release: '2026-03-10',
      date_revision: '2027-03-10',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: [] });
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    expect(component.products().length).toBe(3);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle error when loading products', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBeTruthy();
    expect(component.isLoading()).toBe(false);
  });

  it('should filter products by search term', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.searchTerm.set('Uno');

    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Producto Uno');
  });

  it('should filter products by description', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.searchTerm.set('diferente');

    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].id).toBe('prod-3');
  });

  it('should return all products when search term is empty', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.searchTerm.set('');

    expect(component.filteredProducts().length).toBe(3);
  });

  it('should paginate products correctly', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.pageSize.set(2);

    expect(component.paginatedProducts().length).toBe(2);
    expect(component.totalPages()).toBe(2);
  });

  it('should go to next page', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.pageSize.set(2);
    component.nextPage();

    expect(component.currentPage()).toBe(2);
    expect(component.paginatedProducts().length).toBe(1);
  });

  it('should go to previous page', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.pageSize.set(2);
    component.currentPage.set(2);
    component.previousPage();

    expect(component.currentPage()).toBe(1);
  });

  it('should not go to previous page if on first page', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.previousPage();

    expect(component.currentPage()).toBe(1);
  });

  it('should go to specific page', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.pageSize.set(1);
    component.goToPage(3);

    expect(component.currentPage()).toBe(3);
  });

  it('should reset to page 1 when search term changes', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.currentPage.set(2);
    const event = { target: { value: 'test' } } as unknown as Event;
    component.onSearch(event);

    expect(component.currentPage()).toBe(1);
  });

  it('should reset to page 1 when page size changes', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.currentPage.set(2);
    const event = { target: { value: '10' } } as unknown as Event;
    component.onPageSizeChange(event);

    expect(component.currentPage()).toBe(1);
    expect(component.pageSize()).toBe(10);
  });

  it('should toggle menu', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.toggleMenu('prod-1');
    expect(component.openMenuId()).toBe('prod-1');

    component.toggleMenu('prod-1');
    expect(component.openMenuId()).toBeNull();
  });

  it('should close menu', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.openMenuId.set('prod-1');
    component.closeMenu();

    expect(component.openMenuId()).toBeNull();
  });

  it('should navigate to create page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: [] });

    component.navigateToCreate();

    expect(navigateSpy).toHaveBeenCalledWith(['/product/new']);
  });

  it('should navigate to edit page', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.navigateToEdit('prod-1');

    expect(navigateSpy).toHaveBeenCalledWith(['/product/edit', 'prod-1']);
  });

  it('should open delete modal', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.onDelete(mockProducts[0]);

    expect(component.showDeleteModal()).toBe(true);
    expect(component.productToDelete()?.id).toBe('prod-1');
  });

  it('should close delete modal', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.showDeleteModal.set(true);
    component.productToDelete.set(mockProducts[0]);

    component.closeDeleteModal();

    expect(component.showDeleteModal()).toBe(false);
    expect(component.productToDelete()).toBeNull();
  });

  it('should delete product and reload list', () => {
    fixture.detectChanges();
    const req1 = httpMock.expectOne('http://localhost:3002/bp/products');
    req1.flush({ data: mockProducts });

    component.onDelete(mockProducts[0]);
    component.confirmDelete();

    const deleteReq = httpMock.expectOne('http://localhost:3002/bp/products/prod-1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({ message: 'Product removed successfully' });

    const reloadReq = httpMock.expectOne('http://localhost:3002/bp/products');
    reloadReq.flush({ data: mockProducts.slice(1) });

    expect(component.showDeleteModal()).toBe(false);
  });

  it('should format date correctly', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: [] });

    const formatted = component.formatDate('2026-01-21');
    expect(formatted).toBe('21/01/2026');
  });

  it('should calculate totalResults correctly', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    expect(component.totalResults()).toBe(3);
  });

  it('should show correct canGoPrevious and canGoNext', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.pageSize.set(1);

    expect(component.canGoPrevious()).toBe(false);
    expect(component.canGoNext()).toBe(true);

    component.currentPage.set(2);
    expect(component.canGoPrevious()).toBe(true);
    expect(component.canGoNext()).toBe(true);

    component.currentPage.set(3);
    expect(component.canGoPrevious()).toBe(true);
    expect(component.canGoNext()).toBe(false);
  });

  it('should not go to next page if on last page', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.pageSize.set(5);
    component.nextPage();

    expect(component.currentPage()).toBe(1);
  });

  it('should not go to invalid page', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.goToPage(0);
    expect(component.currentPage()).toBe(1);

    component.goToPage(100);
    expect(component.currentPage()).toBe(1);
  });

  it('should handle delete error', () => {
    fixture.detectChanges();
    const req1 = httpMock.expectOne('http://localhost:3002/bp/products');
    req1.flush({ data: mockProducts });

    component.onDelete(mockProducts[0]);
    component.confirmDelete();

    const deleteReq = httpMock.expectOne('http://localhost:3002/bp/products/prod-1');
    deleteReq.flush({ message: 'Error' }, { status: 500, statusText: 'Server Error' });

    expect(component.isDeleting()).toBe(false);
  });

  it('should not confirm delete if no product selected', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.productToDelete.set(null);
    component.confirmDelete();

    // No debería hacer ninguna petición
    httpMock.expectNone('http://localhost:3002/bp/products/');
  });

  it('should display delete modal message correctly', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.productToDelete.set(mockProducts[0]);

    expect(component.deleteModalMessage()).toContain('Producto Uno');
  });

  it('should return empty message when no product to delete', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });

    component.productToDelete.set(null);

    expect(component.deleteModalMessage()).toBe('');
  });

  it('should render products in table', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('should show empty state when no products', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: [] });
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should show loading skeleton initially', () => {
    // detectChanges dispara ngOnInit que hace la petición
    fixture.detectChanges();

    // Mientras la petición está pendiente, isLoading es true
    expect(component.isLoading()).toBe(true);

    // Completar la petición
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush({ data: mockProducts });
  });

  it('should show error message on error', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const errorMessage = fixture.nativeElement.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
  });

  it('should call loadProducts when retry button clicked', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne('http://localhost:3002/bp/products');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    const retryBtn = fixture.nativeElement.querySelector('.btn-retry');
    retryBtn?.click();

    const retryReq = httpMock.expectOne('http://localhost:3002/bp/products');
    retryReq.flush({ data: mockProducts });
  });
});

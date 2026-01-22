import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '@core/models/product.model';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProduct: Product = {
    id: 'test-1',
    name: 'Producto Test',
    description: 'Descripción de prueba para el producto',
    logo: 'https://example.com/logo.png',
    date_release: '2026-01-21',
    date_revision: '2027-01-21'
  };

  const apiUrl = 'http://localhost:3002/bp/products';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProducts', () => {
    it('should return product list', () => {
      const mockResponse = { data: [mockProduct] };

      service.getProducts().subscribe(products => {
        expect(products.length).toBe(1);
        expect(products[0].id).toBe('test-1');
        expect(products[0].name).toBe('Producto Test');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty list when no products', () => {
      service.getProducts().subscribe(products => {
        expect(products.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ data: [] });
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully', () => {
      const mockResponse = {
        message: 'Product added successfully',
        data: mockProduct
      };

      service.createProduct(mockProduct).subscribe(response => {
        expect(response.message).toBe('Product added successfully');
        expect(response.data.id).toBe('test-1');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockProduct);
      req.flush(mockResponse);
    });

    it('should handle error when creating product', () => {
      const errorMessage = 'Invalid body';

      service.createProduct(mockProduct).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: errorMessage }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateProduct', () => {
    it('should update a product successfully', () => {
      const { id, ...productData } = mockProduct;
      const mockResponse = {
        message: 'Product updated successfully',
        data: mockProduct
      };

      service.updateProduct(id, productData).subscribe(response => {
        expect(response.message).toBe('Product updated successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(productData);
      req.flush(mockResponse);
    });

    it('should handle 404 error when updating non-existent product', () => {
      const { id, ...productData } = mockProduct;

      service.updateProduct('not-found', productData).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/not-found`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', () => {
      const mockResponse = { message: 'Product removed successfully' };

      service.deleteProduct('test-1').subscribe(response => {
        expect(response.message).toBe('Product removed successfully');
      });

      const req = httpMock.expectOne(`${apiUrl}/test-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle 404 error when deleting non-existent product', () => {
      service.deleteProduct('not-found').subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/not-found`);
      req.flush({ message: 'Not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('verifyProductId', () => {
    it('should return true if ID exists', () => {
      service.verifyProductId('test-1').subscribe(exists => {
        expect(exists).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/verification/test-1`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false if ID does not exist', () => {
      service.verifyProductId('new-id').subscribe(exists => {
        expect(exists).toBe(false);
      });

      const req = httpMock.expectOne(`${apiUrl}/verification/new-id`);
      req.flush(false);
    });
  });
});

function fail(arg0: string): void {
  throw new Error('Function not implemented.');
}


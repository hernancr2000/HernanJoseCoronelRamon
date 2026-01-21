import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Product } from '@core/models/product.model';

export interface ProductResponse {
  data: Product[];
}

export interface ProductSingleResponse {
  message: string;
  data: Product;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/bp/products`;

  constructor(private readonly http: HttpClient) {}

  /** F1: Obtener todos los productos */
  getProducts(): Observable<Product[]> {
    return this.http.get<ProductResponse>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  /** F4: Crear producto */
  createProduct(product: Product): Observable<ProductSingleResponse> {
    return this.http.post<ProductSingleResponse>(this.baseUrl, product);
  }

  /** F5: Actualizar producto */
  updateProduct(id: string, product: Omit<Product, 'id'>): Observable<ProductSingleResponse> {
    return this.http.put<ProductSingleResponse>(`${this.baseUrl}/${id}`, product);
  }

  /** F6: Eliminar producto */
  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  /** F4: Verificar si existe un ID */
  verifyProductId(id: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/verification/${id}`);
  }
}

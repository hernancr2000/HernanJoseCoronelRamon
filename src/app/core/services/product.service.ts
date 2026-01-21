import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Product } from '@core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private baseUrl = `${environment.apiUrl}/bp/products`;

  constructor(private http: HttpClient) {}

  
}

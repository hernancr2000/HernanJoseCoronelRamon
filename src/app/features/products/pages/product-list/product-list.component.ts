import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  // Estado
  products = signal<Product[]>([]);
  searchTerm = signal<string>('');
  pageSize = signal<number>(5);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Menú contextual
  openMenuId = signal<string | null>(null);

  // Computed: productos filtrados por búsqueda
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allProducts = this.products();

    if (!term) return allProducts;

    return allProducts.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  });

  // Computed: productos paginados
  paginatedProducts = computed(() => {
    return this.filteredProducts().slice(0, this.pageSize());
  });

  // Computed: total de resultados mostrados
  resultsCount = computed(() => this.paginatedProducts().length);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los productos. Intente nuevamente.');
        this.isLoading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize.set(Number(select.value));
  }

  navigateToCreate(): void {
    this.router.navigate(['/product/new']);
  }

  navigateToEdit(productId: string): void {
    this.router.navigate(['/product/edit', productId]);
    this.closeMenu();
  }

  toggleMenu(productId: string): void {
    if (this.openMenuId() === productId) {
      this.openMenuId.set(null);
    } else {
      this.openMenuId.set(productId);
    }
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  onDelete(product: Product): void {
    // Por ahora solo cerramos el menú, luego implementaremos el modal
    console.log('Delete product:', product.id);
    this.closeMenu();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}

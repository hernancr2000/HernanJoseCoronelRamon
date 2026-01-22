import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.model';
import { ConfirmModalComponent } from '@shared/components/confirm-modal/confirm-modal.component';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // Estado
  products = signal<Product[]>([]);
  searchTerm = signal<string>('');
  pageSize = signal<number>(5);
  currentPage = signal<number>(1);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Menú contextual
  openMenuId = signal<string | null>(null);

  // Modal de confirmación
  showDeleteModal = signal<boolean>(false);
  productToDelete = signal<Product | null>(null);
  isDeleting = signal<boolean>(false);

  // Computed: productos filtrados por búsqueda
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allProducts = this.products();

    if (!term) return allProducts;

    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term),
    );
  });

  // Computed: total de resultados
  totalResults = computed(() => this.filteredProducts().length);

  // Computed: total de páginas
  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize()));

  // Computed: productos paginados
  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredProducts().slice(start, end);
  });

  // Computed: ¿puede ir a página anterior?
  canGoPrevious = computed(() => this.currentPage() > 1);

  // Computed: ¿puede ir a página siguiente?
  canGoNext = computed(() => this.currentPage() < this.totalPages());

  // Computed: mensaje del modal
  deleteModalMessage = computed(() => {
    const product = this.productToDelete();
    return product ? `¿Estás seguro de eliminar el producto ${product.name}?` : '';
  });

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
      },
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize.set(Number(select.value));
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.currentPage.update((p) => p - 1);
    }
  }

  nextPage(): void {
    if (this.canGoNext()) {
      this.currentPage.update((p) => p + 1);
    }
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
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
    this.closeMenu();
  }

  // Confirmar eliminación
  confirmDelete(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.isDeleting.set(true);

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.notificationService.show('Producto eliminado exitosamente', 'success');
        this.closeDeleteModal();
        this.loadProducts();

        // Ajustar página si es necesario
        if (this.paginatedProducts().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((p) => p - 1);
        }
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.notificationService.show('Error al eliminar el producto', 'error');
        this.isDeleting.set(false);
      },
    });
  }

  // Cerrar modal
  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
    this.isDeleting.set(false);
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

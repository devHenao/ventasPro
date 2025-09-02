import { Component, OnInit, OnDestroy, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../../data/services/product.service';
import { CategoryService } from '../../../data/services/category.service';
import { FilterService } from '../../../data/services/filter.service';
import { Product, PaginatedResponse } from '../../../domain/entities/product.entity';
import { Category } from '../../../domain/entities/category.entity';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private filterService = inject(FilterService);
  private http = inject(HttpClient);

  // State
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategoryId = signal<number | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = 12;
  totalItems = signal(0);

  // Filters
  searchTerm = signal('');
  sortBy = signal('name-asc');
  
  // Computed values
  totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage));
  paginatedProducts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.products().slice(startIndex, startIndex + this.itemsPerPage);
  });

  // Search debounce
  private searchTerms = new Subject<string>();
  
  // Clean up subscriptions
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Public properties for template
  Math = Math;
  
  // Public getters for template
  get currentPageNum() {
    return this.currentPage();
  }
  
  get totalItemsCount() {
    return this.totalItems();
  }
  
  get isFirstPage() {
    return this.currentPage() === 1;
  }
  
  get isLastPage() {
    return this.currentPage() >= this.totalPages();
  }

  ngOnInit() {
    // Initialize search with debounce
    this.setupSearch();
    
    // Load initial data
    this.loadCategories().then(() => {
      this.loadProducts();
    }).catch(error => {
      console.error('Error initializing component:', error);
      this.error.set('Error al inicializar el componente');
      this.loading.set(false);
    });
  }

  private async loadCategories(): Promise<void> {
    try {
      const categories = await this.categoryService.getCategories().toPromise();
      this.categories.set(categories || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading categories:', errorMessage);
      this.error.set('Error al cargar las categorías');
      throw error;
    }
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.productService.getProducts().subscribe({
      next: (response: PaginatedResponse<Product>) => {
        try {
          // Filter and sort products locally since we're using local JSON
          let filteredProducts = [...response.items];
          
          // Apply category filter
          const selectedCategoryId = this.selectedCategoryId();
          if (selectedCategoryId) {
            filteredProducts = filteredProducts.filter(
              p => p.category?.id === selectedCategoryId
            );
          }
          
          // Apply search filter
          const searchTerm = this.searchTerm().toLowerCase();
          if (searchTerm) {
            filteredProducts = filteredProducts.filter(
              p => p.name.toLowerCase().includes(searchTerm) ||
                   (p.description?.toLowerCase() ?? '').includes(searchTerm) ||
                   p.category?.name?.toLowerCase().includes(searchTerm)
            );
          }
          
          // Apply sorting
          const sortedProducts = this.sortProducts(filteredProducts);
          
          // Update state
          this.products.set(sortedProducts);
          this.totalItems.set(sortedProducts.length);
          
          // Reset to first page if current page is no longer valid
          const maxPage = Math.max(1, this.totalPages());
          if (this.currentPage() > maxPage) {
            this.currentPage.set(maxPage);
          }
        } catch (err) {
          console.error('Error processing products:', err);
          this.error.set('Error al procesar los productos');
        } finally {
          this.loading.set(false);
        }
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.error.set(
          'Error al cargar los productos. Por favor, intente nuevamente.'
        );
        this.loading.set(false);
      },
    });
  }

  private setupSearch() {
    // Search functionality is handled in constructor with searchSubject
    // No additional setup needed here
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.searchTerms.next(term);
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategoryId.set(categoryId);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSortChange(sortBy: string) {
    this.sortBy.set(sortBy);
    this.loadProducts();
  }

  // Helper method to generate page numbers for pagination with ellipsis
  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    pages.push(1);
    
    // If only one page, return early
    if (total <= 1) return pages;
    
    // Calculate range of pages to show
    let startPage = 2;
    let endPage = Math.min(total - 1, maxVisiblePages + 1);
    
    if (total > maxVisiblePages + 2) {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (current <= maxPagesBeforeCurrent + 1) {
        // Near the start
        endPage = maxVisiblePages + 1;
      } else if (current + maxPagesAfterCurrent >= total) {
        // Near the end
        startPage = total - maxVisiblePages;
        endPage = total - 1;
      } else {
        // Somewhere in the middle
        startPage = current - maxPagesBeforeCurrent + 1;
        endPage = current + maxPagesAfterCurrent - 1;
      }
    }
    
    // Add first ellipsis if needed
    if (startPage > 2) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Add page numbers in range
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < total) {
        pages.push(i);
      }
    }
    
    // Add last ellipsis if needed
    if (endPage < total - 1) {
      pages.push(-1); // -1 represents ellipsis
    }
    
    // Always add last page if there is more than one page
    if (total > 1) {
      pages.push(total);
    }
    
    return pages;
  }

  onPageChange(page: number) {
    const totalPages = Math.ceil(this.totalItems() / this.itemsPerPage);
    if (page < 1 || page > totalPages) {
      return;
    }
    this.currentPage.set(page);
    this.loadProducts();
    window.scrollTo(0, 0);
  }

  // Helper method to sort products
  private sortProducts(products: Product[]) {
    const sortBy = this.sortBy();
    if (!sortBy) return products;

    const [field, direction] = sortBy.split('-') as [string, 'asc' | 'desc'];
    return [...products].sort((a: Product, b: Product) => {
      let comparison = 0;

      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'price') {
        comparison = (a.price || 0) - (b.price || 0);
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }
}

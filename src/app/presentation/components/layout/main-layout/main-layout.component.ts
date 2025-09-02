import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../data/services/cart.service';
import { FavoritesService } from '../../../../data/services/favorites.service';
import { FilterService } from '../../../../data/services/filter.service';
import { CategoryService } from '../../../../data/services/category.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);
  private filterService = inject(FilterService);
  private categoryService = inject(CategoryService);

  // Sidebar states
  leftSidebarOpen = signal(false);
  rightSidebarOpen = signal(false);

  // Cart computed values
  cartItems = computed(() => this.cartService.cartItems());
  cartTotal = computed(() => this.cartService.cartTotal());
  cartItemsCount = computed(() => this.cartService.totalItems());
  favoriteIds = computed(() => this.favoritesService.favoriteProductIds());

  // Filter values
  currentFilters = computed(() => this.filterService.currentFilters());
  hasActiveFilters = computed(() => this.filterService.hasActiveFilters());

  // Categories for filter
  categories = signal<any[]>([]);
  categoriesLoading = signal(false);

  ngOnInit() {
    this.loadCategories();
  }

  private loadCategories() {
    this.categoriesLoading.set(true);
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoriesLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categoriesLoading.set(false);
      }
    });
  }

  toggleLeftSidebar() {
    this.leftSidebarOpen.update(open => !open);
  }

  toggleRightSidebar() {
    this.rightSidebarOpen.update(open => !open);
  }

  closeLeftSidebar() {
    this.leftSidebarOpen.set(false);
  }

  closeRightSidebar() {
    this.rightSidebarOpen.set(false);
  }

  removeFromCart(productId: number, variantId: number) {
    this.cartService.removeItem(productId, variantId);
  }

  updateCartQuantity(productId: number, variantId: number, quantity: number) {
    this.cartService.updateItemQuantity(productId, variantId, quantity);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  // Filter methods
  onPriceRangeChange(min: number, max: number) {
    this.filterService.updatePriceRange(min, max);
    this.notifyFilterChange();
  }

  onCategoryToggle(categoryId: number) {
    this.filterService.toggleCategory(categoryId);
    this.notifyFilterChange();
  }

  onBrandToggle(brand: string) {
    this.filterService.toggleBrand(brand);
    this.notifyFilterChange();
  }

  onInStockToggle(inStockOnly: boolean) {
    this.filterService.updateInStockOnly(inStockOnly);
    this.notifyFilterChange();
  }

  onRatingChange(minRating: number) {
    this.filterService.updateMinRating(minRating);
    this.notifyFilterChange();
  }

  clearAllFilters() {
    this.filterService.clearAllFilters();
    this.notifyFilterChange();
  }

  private notifyFilterChange() {
    // Emit an event that the home component can listen to
    window.dispatchEvent(new CustomEvent('sidebarFiltersChanged'));
  }

  // Helper methods for template event handling
  onMinPriceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.onPriceRangeChange(+target.value, this.currentFilters().priceRange.max);
  }

  onMaxPriceChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.onPriceRangeChange(this.currentFilters().priceRange.min, +target.value);
  }

  onStockFilterChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.onInStockToggle(target.checked);
  }

}

import { Injectable, signal, computed } from '@angular/core';

export interface ProductFilters {
  priceRange: {
    min: number;
    max: number;
  };
  selectedCategories: number[];
  selectedBrands: string[];
  inStockOnly: boolean;
  minRating: number;
  searchTerm: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filters = signal<ProductFilters>({
    priceRange: { min: 0, max: 10000 },
    selectedCategories: [],
    selectedBrands: [],
    inStockOnly: false,
    minRating: 0,
    searchTerm: ''
  });

  // Expose filters as readonly signal
  currentFilters = this.filters.asReadonly();

  // Computed values
  hasActiveFilters = computed(() => {
    const f = this.filters();
    return f.selectedCategories.length > 0 ||
           f.selectedBrands.length > 0 ||
           f.inStockOnly ||
           f.minRating > 0 ||
           f.searchTerm.trim() !== '' ||
           f.priceRange.min > 0 ||
           f.priceRange.max < 10000;
  });

  updatePriceRange(min: number, max: number) {
    this.filters.update(current => ({
      ...current,
      priceRange: { min, max }
    }));
  }

  toggleCategory(categoryId: number) {
    this.filters.update(current => {
      const categories = [...current.selectedCategories];
      const index = categories.indexOf(categoryId);
      
      if (index > -1) {
        categories.splice(index, 1);
      } else {
        categories.push(categoryId);
      }
      
      return {
        ...current,
        selectedCategories: categories
      };
    });
  }

  toggleBrand(brand: string) {
    this.filters.update(current => {
      const brands = [...current.selectedBrands];
      const index = brands.indexOf(brand);
      
      if (index > -1) {
        brands.splice(index, 1);
      } else {
        brands.push(brand);
      }
      
      return {
        ...current,
        selectedBrands: brands
      };
    });
  }

  updateInStockOnly(inStockOnly: boolean) {
    this.filters.update(current => ({
      ...current,
      inStockOnly
    }));
  }

  updateMinRating(minRating: number) {
    this.filters.update(current => ({
      ...current,
      minRating
    }));
  }

  updateSearchTerm(searchTerm: string) {
    this.filters.update(current => ({
      ...current,
      searchTerm
    }));
  }

  clearAllFilters() {
    this.filters.set({
      priceRange: { min: 0, max: 10000 },
      selectedCategories: [],
      selectedBrands: [],
      inStockOnly: false,
      minRating: 0,
      searchTerm: ''
    });
  }
}

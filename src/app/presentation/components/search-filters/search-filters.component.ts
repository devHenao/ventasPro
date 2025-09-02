import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../domain/entities/category.entity';

type SortOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent {
  @Input() categories: Category[] = [];
  @Input() selectedCategoryId: number | null = null;
  @Input() sortOptions: SortOption[] = [
    { value: 'name-asc', label: 'Nombre (A-Z)' },
    { value: 'name-desc', label: 'Nombre (Z-A)' },
    { value: 'price-asc', label: 'Precio (menor a mayor)' },
    { value: 'price-desc', label: 'Precio (mayor a menor)' },
    { value: 'newest', label: 'Más recientes' },
  ];
  @Input() selectedSort: string = 'name-asc';
  @Input() searchQuery: string = '';
  
  @Output() categoryChange = new EventEmitter<number | null>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterReset = new EventEmitter<void>();
  
  // UI State
  showMobileFilters = signal(false);
  
  // Computed values
  selectedCategoryName = computed(() => {
    if (!this.selectedCategoryId) return 'Todas las categorías';
    return this.categories.find(c => c.id === this.selectedCategoryId)?.name || 'Categoría';
  });
  
  onCategorySelect(categoryId: number | null): void {
    this.categoryChange.emit(categoryId);
  }
  
  onSortChange(sortValue: string): void {
    this.sortChange.emit(sortValue);
  }
  
  onSearch(): void {
    this.searchChange.emit(this.searchQuery);
  }
  
  onReset(): void {
    this.searchQuery = '';
    this.filterReset.emit();
  }
  
  toggleMobileFilters(): void {
    this.showMobileFilters.update(value => !value);
  }
}

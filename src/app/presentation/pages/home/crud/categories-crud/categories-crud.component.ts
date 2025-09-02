import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../../../data/services/category.service';
import { Category } from '../../../../../domain/entities/category.entity';

@Component({
  selector: 'app-categories-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categories-crud.component.html',
  styleUrls: ['./categories-crud.component.scss']
})
export class CategoriesCrudComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  // Signals
  categories = signal<Category[]>([]);
  filteredCategories = signal<Category[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  // Search and filters
  searchTerm = signal('');
  sortField = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Modal state
  showModal = signal(false);
  editingCategory = signal<Category | null>(null);
  isEditing = signal(false);

  // Form
  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  async loadCategories() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const categories = await this.categoryService.getCategories().toPromise();
      if (categories) {
        let filteredData = categories;

        // Apply search filter
        if (this.searchTerm()) {
          filteredData = filteredData.filter(category =>
            category.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
(category.description || '').toLowerCase().includes(this.searchTerm().toLowerCase())
          );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
          let aValue: any, bValue: any;
          if (this.sortField() === 'name') {
            aValue = a.name;
            bValue = b.name;
          } else if (this.sortField() === 'id') {
            aValue = a.id;
            bValue = b.id;
          }

          if (this.sortDirection() === 'asc') {
            return (aValue || '') > (bValue || '') ? 1 : -1;
          } else {
            return (aValue || '') < (bValue || '') ? 1 : -1;
          }
        });

        // Apply pagination
        this.totalItems.set(filteredData.length);
        this.totalPages.set(Math.ceil(filteredData.length / this.itemsPerPage()));

        const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
        const endIndex = startIndex + this.itemsPerPage();

        this.categories.set(categories);
        this.filteredCategories.set(filteredData.slice(startIndex, endIndex));
      }
    } catch (error) {
      this.error.set('Error al cargar categorías');
      console.error('Error loading categories:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.currentPage.set(1);
    this.loadCategories();
  }

  onSort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.loadCategories();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCategories();
  }

  onItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadCategories();
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.editingCategory.set(null);
    this.categoryForm.reset({
      name: '',
      description: '',
      isActive: true
    });
    this.showModal.set(true);
  }

  openEditModal(category: Category) {
    this.isEditing.set(true);
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      isActive: category.isActive
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCategory.set(null);
    this.categoryForm.reset();
  }

  async onSubmit() {
    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;

      try {
        if (this.isEditing()) {
          const category = this.editingCategory();
          if (category) {
            await this.categoryService.updateCategory(category.id, formData).toPromise();
          }
        } else {
          await this.categoryService.createCategory(formData).toPromise();
        }

        this.closeModal();
        this.loadCategories();
      } catch (error) {
        console.error('Error saving category:', error);
        this.error.set('Error al guardar la categoría');
      }
    }
  }

  async deleteCategory(category: Category) {
    if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      try {
        await this.categoryService.deleteCategory(category.id).toPromise();
        this.loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        this.error.set('Error al eliminar la categoría');
      }
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return 'bi-arrow-down-up';
    return this.sortDirection() === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }

    return pages;
  }
}

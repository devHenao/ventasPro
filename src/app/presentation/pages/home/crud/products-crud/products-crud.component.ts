import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../../data/services/product.service';
import { CategoryService } from '../../../../../data/services/category.service';
import { Product } from '../../../../../domain/entities/product.entity';
import { Category } from '../../../../../domain/entities/category.entity';

@Component({
  selector: 'app-products-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products-crud.component.html',
  styleUrls: ['./products-crud.component.scss']
})
export class ProductsCrudComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  // Signals
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  filteredProducts = signal<Product[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);
  totalItems = signal(0);
  totalPages = signal(0);

  // Search and filters
  searchTerm = signal('');
  selectedCategory = signal<string>('');
  sortField = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Modal state
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  isEditing = signal(false);

  // Form
  productForm: FormGroup;

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', [Validators.required]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  async loadProducts() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.productService.getProducts().toPromise();

      if (response) {
        let filteredData = response.items;

        // Apply search filter
        if (this.searchTerm()) {
          filteredData = filteredData.filter(product =>
            product.name.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
            product.description.toLowerCase().includes(this.searchTerm().toLowerCase())
          );
        }

        // Apply category filter
        if (this.selectedCategory()) {
          filteredData = filteredData.filter(product =>
            product.category.id.toString() === this.selectedCategory()
          );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
          let aValue: any, bValue: any;
          if (this.sortField() === 'name') {
            aValue = a.name;
            bValue = b.name;
          } else if (this.sortField() === 'price') {
            aValue = a.price;
            bValue = b.price;
          } else if (this.sortField() === 'stock') {
            aValue = a.stock || 0;
            bValue = b.stock || 0;
          }

          if (this.sortDirection() === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        // Apply pagination
        this.totalItems.set(filteredData.length);
        this.totalPages.set(Math.ceil(filteredData.length / this.itemsPerPage()));

        const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
        const endIndex = startIndex + this.itemsPerPage();

        this.products.set(response.items);
        this.filteredProducts.set(filteredData.slice(startIndex, endIndex));
      }
    } catch (error) {
      this.error.set('Error al cargar productos');
      console.error('Error loading products:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadCategories() {
    try {
      const categories = await this.categoryService.getCategories().toPromise();
      if (categories) {
        this.categories.set(categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onCategoryFilter(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onSort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.loadProducts();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
  }

  onItemsPerPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage.set(parseInt(target.value));
    this.currentPage.set(1);
    this.loadProducts();
  }

  openCreateModal() {
    this.isEditing.set(false);
    this.editingProduct.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      stock: 0,
      imageUrl: '',
      isActive: true
    });
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.isEditing.set(true);
    this.editingProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.category.id,
      stock: product.stock,
      imageUrl: product.images?.[0]?.url || '',
      isActive: product.isActive
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduct.set(null);
    this.productForm.reset();
  }

  async onSubmit() {
    if (this.productForm.valid) {
      const formData = this.productForm.value;

      try {
        if (this.isEditing()) {
          const product = this.editingProduct();
          if (product) {
            await this.productService.updateProduct(product.id, formData).toPromise();
          }
        } else {
          await this.productService.createProduct(formData).toPromise();
        }

        this.closeModal();
        this.loadProducts();
      } catch (error) {
        console.error('Error saving product:', error);
        this.error.set('Error al guardar el producto');
      }
    }
  }

  async deleteProduct(product: Product) {
    if (confirm(`¿Estás seguro de que quieres eliminar el producto "${product.name}"?`)) {
      try {
        await this.productService.deleteProduct(product.id).toPromise();
        this.loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        this.error.set('Error al eliminar el producto');
      }
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories().find(c => c.id === categoryId);
    return category?.name || 'Sin categoría';
  }

  getProductImage(product: Product): string {
    return product.images?.[0]?.url || '';
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

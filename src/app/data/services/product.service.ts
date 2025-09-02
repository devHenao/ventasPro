import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, mergeMap } from 'rxjs';
import { Product, ProductFilterOptions, ProductSortOption, PaginatedResponse } from '../../domain/entities/product.entity';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'assets/data/products.json';

  // Estado de filtros y ordenamiento
  private filters = signal<Partial<ProductFilterOptions>>({});
  private sortOption = signal<ProductSortOption>({
    field: 'name',
    direction: 'asc',
    label: 'Nombre (A-Z)'
  });
  private currentPage = signal(1);
  private pageSize = signal(12);

  // Opciones de ordenamiento disponibles
  readonly sortOptions: ProductSortOption[] = [
    { field: 'name', direction: 'asc', label: 'Nombre (A-Z)' },
    { field: 'name', direction: 'desc', label: 'Nombre (Z-A)' },
    { field: 'price', direction: 'asc', label: 'Precio (menor a mayor)' },
    { field: 'price', direction: 'desc', label: 'Precio (mayor a menor)' },
    { field: 'createdAt', direction: 'desc', label: 'Más recientes' },
    { field: 'rating', direction: 'desc', label: 'Mejor valorados' }
  ];

  // Obtener productos con filtros y paginación
  getProducts(): Observable<PaginatedResponse<Product>> {
    return this.getMockProducts().pipe(
      map((products) => {
        // Aplicar filtros
        const filtered = this.applyFilters(products);
        // Aplicar ordenamiento
        const sorted = this.applySorting(filtered);
        // Paginación
        const page = this.currentPage();
        const pageSize = this.pageSize();
        const totalItems = sorted.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const start = (page - 1) * pageSize;
        const items = sorted.slice(start, start + pageSize);
        return {
          items,
          page,
          pageSize,
          totalItems,
          totalPages
        } as PaginatedResponse<Product>;
      })
    );
  }

  // Obtener un producto por su ID
  getProductById(id: number): Observable<Product | undefined> {
    // Simulación de búsqueda en datos mock
    return this.getMockProducts().pipe(
      map(products => products.find(p => p.id === id))
    );
  }

  // Actualizar filtros
  updateFilters(filters: Partial<ProductFilterOptions>): void {
    this.filters.set({ ...this.filters(), ...filters });
    this.currentPage.set(1); // Resetear a la primera página al cambiar filtros
  }

  // Actualizar ordenamiento
  updateSort(option: ProductSortOption): void {
    this.sortOption.set(option);
  }

  // Actualizar paginación
  updatePagination(page: number, pageSize?: number): void {
    this.currentPage.set(page);
    if (pageSize) {
      this.pageSize.set(pageSize);
    }
  }

  // Obtener las categorías únicas de los productos
  getCategories(): Observable<{ id: number; name: string; count: number }[]> {
    return this.getMockProducts().pipe(
      map(products => {
        const categoryMap = new Map<number, { id: number; name: string; count: number }>();

        products.forEach(product => {
          const category = product.category;
          if (!categoryMap.has(category.id)) {
            categoryMap.set(category.id, { ...category, count: 0 });
          }
          categoryMap.get(category.id)!.count++;
        });

        return Array.from(categoryMap.values());
      })
    );
  }

  // Datos de ejemplo (en un caso real vendrían de una API)
  private getMockProducts(): Observable<Product[]> {
    // Datos hardcodeados para prueba
    const mockProducts: Product[] = [
      {
        id: 1,
        name: "Laptop Dell XPS 13",
        description: "Laptop ultradelgada con procesador Intel i7, 16GB RAM, 512GB SSD",
        price: 1299.99,
        stock: 10,
        images: [
          { id: 1, url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500", altText: "Dell XPS 13", isMain: true, order: 1 },
          { id: 2, url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500", altText: "Dell XPS 13 vista lateral", isMain: false, order: 2 }
        ],
        category: { id: 3, name: "Laptops", slug: "laptops", isActive: true },
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
      },
      {
        id: 2,
        name: "Mouse Logitech MX Master 3",
        description: "Mouse inalámbrico ergonómico para productividad avanzada",
        price: 99.99,
        stock: 25,
        images: [
          { id: 3, url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500", altText: "Mouse Logitech", isMain: true, order: 1 },
          { id: 4, url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500", altText: "Mouse vista superior", isMain: false, order: 2 }
        ],
        category: { id: 5, name: "Mouse y Teclados", slug: "mouse-teclados", isActive: true },
        isActive: true,
        createdAt: "2024-01-02T00:00:00.000Z"
      },
      {
        id: 3,
        name: "MacBook Pro M3",
        description: "MacBook Pro 14 pulgadas con chip M3, 18GB RAM, 1TB SSD",
        price: 2199.99,
        stock: 5,
        images: [
          { id: 5, url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", altText: "MacBook Pro", isMain: true, order: 1 },
          { id: 6, url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500", altText: "MacBook Pro abierto", isMain: false, order: 2 }
        ],
        category: { id: 3, name: "Laptops", slug: "laptops", isActive: true },
        isActive: true,
        createdAt: "2024-01-03T00:00:00.000Z"
      }
    ];
    
    return of(mockProducts).pipe(delay(500));
  }

  private applyFilters(products: Product[]): Product[] {
    const filters = this.filters();
    return products.filter(product => {
      // Filtrar por categoría
      if (filters.categories?.length && !filters.categories.includes(product.category.id)) {
        return false;
      }

      // Filtrar por rango de precios
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      // Filtrar por búsqueda
      if (filters.search && !this.matchesSearch(product, filters.search)) {
        return false;
      }

      // Filtros adicionales
      if (filters.inStock && (product.stock ?? 0) <= 0) return false;
      if (filters.onSale && !product.originalPrice) return false;
      if (filters.featured && !product.isFeatured) return false;

      return true;
    });
  }

  private matchesSearch(product: Product, searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.name.toLowerCase().includes(term) ||
      (product.tags?.some(tag => tag.toLowerCase().includes(term)) ?? false)
    );
  }

  private applySorting(products: Product[]): Product[] {
    const { field, direction } = this.sortOption();
    return [...products].sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'popularity':
          comparison = (a.reviewCount || 0) - (b.reviewCount || 0);
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  private paginate(products: Product[]): PaginatedResponse<Product> {
    const page = this.currentPage();
    const pageSize = this.pageSize();
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      items: products.slice(startIndex, endIndex),
      page,
      pageSize,
      totalItems: products.length,
      totalPages: Math.ceil(products.length / pageSize)
    };
  }

  // CRUD Methods
  createProduct(productData: ProductFormData): Observable<Product> {
    // Simulate API call
    const newProduct: Product = {
      id: Date.now(), // Simple ID generation for mock
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      images: productData.imageUrl ? [
        { id: Date.now(), url: productData.imageUrl, altText: productData.name, isMain: true, order: 1 }
      ] : [],
      category: { id: Number(productData.categoryId), name: '', slug: '', isActive: true },
      isActive: productData.isActive,
      createdAt: new Date().toISOString()
    };
    
    console.log('Creating product:', newProduct);
    return of(newProduct).pipe(delay(500));
  }

  updateProduct(id: number, productData: ProductFormData): Observable<Product> {
    // Simulate API call
    const updatedProduct: Product = {
      id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      images: productData.imageUrl ? [
        { id: Date.now(), url: productData.imageUrl, altText: productData.name, isMain: true, order: 1 }
      ] : [],
      category: { id: Number(productData.categoryId), name: '', slug: '', isActive: true },
      isActive: productData.isActive,
      createdAt: new Date().toISOString()
    };
    
    console.log('Updating product:', updatedProduct);
    return of(updatedProduct).pipe(delay(500));
  }

  deleteProduct(id: number): Observable<boolean> {
    // Simulate API call
    console.log('Deleting product with ID:', id);
    return of(true).pipe(delay(500));
  }
}

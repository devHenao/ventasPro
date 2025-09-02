import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import {
  Product,
  ProductFilterOptions,
  ProductSortOption,
  PaginatedResponse,
} from '../../domain/entities/product.entity';

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
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Estado de filtros y ordenamiento
  private filters = signal<Partial<ProductFilterOptions>>({});
  private sortOption = signal<ProductSortOption>({
    field: 'name',
    direction: 'asc',
    label: 'Nombre (A-Z)',
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
    { field: 'rating', direction: 'desc', label: 'Mejor valorados' },
  ];

  // Obtener productos con filtros y paginación
  getProducts(): Observable<PaginatedResponse<Product>> {
    const filters = this.filters();
    const sort = this.sortOption();
    const page = this.currentPage();
    const pageSize = this.pageSize();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // Agregar filtros como parámetros
    if (filters.categories?.length === 1) {
      params = params.set('categoryId', filters.categories[0].toString());
    }
    if (filters.minPrice !== undefined) {
      params = params.set('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice !== undefined) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }
    if (sort.field && sort.direction) {
      params = params.set('sort', sort.field).set('dir', sort.direction);
    }

    return this.http
      .get<PaginatedResponse<Product>>('http://10.72.5.55:5262/catalog/getAllProducts', {
        params,
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((product) => ({
            ...product,
            category: {
              id: product.categoryId,
              name: product.categoryName,
              slug: product.categoryName.toLowerCase().replace(/\s+/g, '-'),
              isActive: true,
            },
            createdAt: new Date(product.createdAt),
          })),
        })),
        catchError((error) => {
          console.error('Error loading products:', error);
          return of({
            items: [],
            page: 1,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
          } as PaginatedResponse<Product>);
        })
      );
  }

  // Obtener un producto por su ID
  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<Product>(`http://10.72.5.55:5262/catalog/getProductById/${id}`).pipe(
      map((product) => ({
        ...product,
        category: {
          id: product.categoryId,
          name: product.categoryName,
          slug: product.categoryName.toLowerCase().replace(/\s+/g, '-'),
          isActive: true,
        },
        createdAt: new Date(product.createdAt),
      })),
      catchError((error) => {
        console.error('Error loading product:', error);
        return of(undefined);
      })
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
    return this.getProducts().pipe(
      map((response) => {
        const categoryMap = new Map<
          number,
          { id: number; name: string; count: number }
        >();

        response.items.forEach((product) => {
          if (!categoryMap.has(product.categoryId)) {
            categoryMap.set(product.categoryId, {
              id: product.categoryId,
              name: product.categoryName,
              count: 0,
            });
          }
          categoryMap.get(product.categoryId)!.count++;
        });

        return Array.from(categoryMap.values());
      })
    );
  }



  // CRUD Methods
  createProduct(productData: ProductFormData): Observable<Product> {
    return this.http
      .post<Product>('http://10.72.5.55:5262/api/Products/createProduct', productData, { headers: this.getAuthHeaders() })
      .pipe(
        map((product) => ({
          ...product,
          createdAt: new Date(product.createdAt),
        })),
        catchError((error) => {
          console.error('Error creating product:', error);
          throw error;
        })
      );
  }

  updateProduct(id: number, productData: ProductFormData): Observable<Product> {
    return this.http
      .put<Product>(`http://10.72.5.55:5262/api/Products/updateProductById/${id}`, productData, { headers: this.getAuthHeaders() })
      .pipe(
        map((product) => ({
          ...product,
          createdAt: new Date(product.createdAt),
        })),
        catchError((error) => {
          console.error('Error updating product:', error);
          throw error;
        })
      );
  }

  deleteProduct(id: number): Observable<boolean> {
    return this.http
      .delete<any>(`http://10.72.5.55:5262/api/Products/deleteProductById/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error deleting product:', error);
          return of(false);
        })
      );
  }
}

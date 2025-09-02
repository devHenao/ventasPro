import { Injectable, inject } from '@angular/core';
import { Observable, of, map, catchError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductRepository } from '../../domain/repositories/product.repository';
import {
  Product,
  Category,
  ProductImage,
  ProductVariant,
  PaginatedResponse,
} from '../../domain/entities/product.entity';

@Injectable({
  providedIn: 'root',
})
export class ProductRepositoryImpl extends ProductRepository {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/catalog';
  private categories: Category[] = [];
  private products: Product[] = [];

  getAll(): Observable<Product[]> {
    return this.http
      .get<PaginatedResponse<Product>>(`${this.API_URL}/getAllProducts`)
      .pipe(
        map((response) =>
          response.items.map((product) => ({
            ...product,
            category: {
              id: product.categoryId,
              name: product.categoryName,
              slug: product.categoryName.toLowerCase().replace(/\s+/g, '-'),
              isActive: true,
            },
            createdAt: new Date(product.createdAt),
          }))
        ),
        catchError((error) => {
          console.error('Error loading products:', error);
          return of(this.products.filter((p) => p.isActive));
        })
      );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/getProduct/${id}`).pipe(
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
        const product = this.products.find((p) => p.id === id && p.isActive);
        if (!product) throw new Error('Product not found');
        return of(product);
      })
    );
  }

  getByCategoryId(categoryId: number): Observable<Product[]> {
    const params = new HttpParams().set('categoryId', categoryId.toString());

    return this.http
      .get<PaginatedResponse<Product>>(`${this.API_URL}/getAllProducts`, {
        params,
      })
      .pipe(
        map((response) =>
          response.items.map((product) => ({
            ...product,
            category: {
              id: product.categoryId,
              name: product.categoryName,
              slug: product.categoryName.toLowerCase().replace(/\s+/g, '-'),
              isActive: true,
            },
            createdAt: new Date(product.createdAt),
          }))
        ),
        catchError((error) => {
          console.error('Error loading products by category:', error);
          return of(
            this.products
              .filter(
                (p) =>
                  (p.categoryId || p.category?.id) === categoryId && p.isActive
              )
              .map((p) => ({ ...p }))
          );
        })
      );
  }

  create(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: Math.max(0, ...this.products.map((p) => p.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(newProduct);
    return of({ ...newProduct });
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updatedProduct = {
      ...this.products[index],
      ...product,
      id, // Asegurar que el ID no cambie
      updatedAt: new Date(),
    };

    this.products[index] = updatedProduct;
    return of({ ...updatedProduct });
  }

  delete(id: number): Observable<void> {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    this.products[index].isActive = false;
    return of(void 0);
  }
}

import { Observable } from 'rxjs';
import { Product } from '../entities/product.entity';

export abstract class ProductRepository {
  abstract getAll(): Observable<Product[]>;
  abstract getById(id: number): Observable<Product>;
  abstract getByCategoryId(categoryId: number): Observable<Product[]>;
  abstract create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product>;
  abstract update(id: number, product: Partial<Product>): Observable<Product>;
  abstract delete(id: number): Observable<void>;
}

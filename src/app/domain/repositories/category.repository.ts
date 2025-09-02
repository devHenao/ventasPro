import { Observable } from 'rxjs';
import { Category } from '../entities/category.entity';

export abstract class CategoryRepository {
  abstract getAll(): Observable<Category[]>;
  abstract getById(id: number): Observable<Category>;
  abstract getByParentId(parentId: number): Observable<Category[]>;
  abstract create(category: Omit<Category, 'id' | 'createdAt'>): Observable<Category>;
  abstract update(id: number, category: Partial<Category>): Observable<Category>;
  abstract delete(id: number): Observable<void>;
}

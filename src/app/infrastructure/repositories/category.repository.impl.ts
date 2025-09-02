import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { Category } from '../../domain/entities/category.entity';

@Injectable({
  providedIn: 'root',
})
export class CategoryRepositoryImpl extends CategoryRepository {
  private categories: Category[] = [];

  getAll(): Observable<Category[]> {
    return of(this.categories.filter((c) => c.isActive));
  }

  getById(id: number): Observable<Category> {
    const category = this.categories.find((c) => c.id === id && c.isActive);
    if (!category) throw new Error('Category not found');
    return of(category);
  }

  getByParentId(parentId: number): Observable<Category[]> {
    return of(
      this.categories.filter((c) => c.parentId === parentId && c.isActive)
    );
  }

  create(category: Omit<Category, 'id' | 'createdAt'>): Observable<Category> {
    const newCategory: Category = {
      ...category,
      id: Math.max(...this.categories.map((c) => c.id)) + 1,
      createdAt: new Date(),
    };
    this.categories.push(newCategory);
    return of(newCategory);
  }

  update(id: number, categoryData: Partial<Category>): Observable<Category> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    this.categories[index] = { ...this.categories[index], ...categoryData };
    return of(this.categories[index]);
  }

  delete(id: number): Observable<void> {
    const index = this.categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    this.categories[index].isActive = false;
    return of(void 0);
  }
}

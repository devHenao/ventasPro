import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';
import { AuthService } from './auth.service';

interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>('http://10.72.5.55:5262/catalog/getAllCategories?flat=false')
      .pipe(
        map((categories) =>
          categories.map((cat) => ({
            ...cat,
            createdAt: new Date(cat.createdAt),
          }))
        ),
        catchError((error) => {
          console.error('Error loading categories:', error);
          return of([]);
        })
      );
  }

  createCategory(categoryData: CategoryFormData): Observable<Category> {
    return this.http
      .post<Category>('http://10.72.5.55:5262/api/Categories/createCategory', categoryData, { headers: this.getAuthHeaders() })
      .pipe(
        map((category) => ({
          ...category,
          createdAt: new Date(category.createdAt),
        })),
        catchError((error) => {
          console.error('Error creating category:', error);
          throw error;
        })
      );
  }

  updateCategory(id: number, categoryData: CategoryFormData): Observable<Category> {
    return this.http
      .put<Category>(`http://10.72.5.55:5262/api/Categories/updateCategoryById/${id}`, categoryData, { headers: this.getAuthHeaders() })
      .pipe(
        map((category) => ({
          ...category,
          createdAt: new Date(category.createdAt),
        })),
        catchError((error) => {
          console.error('Error updating category:', error);
          throw error;
        })
      );
  }

  deleteCategory(id: number): Observable<boolean> {
    return this.http
      .delete<any>(`http://10.72.5.55:5262/api/Categories/deleteCategoryById/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error deleting category:', error);
          return of(false);
        })
      );
  }
}

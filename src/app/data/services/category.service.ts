import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { Category } from '../../domain/entities/category.entity';

interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private categoriesUrl = 'assets/data/categories.json';

  getCategories(): Observable<Category[]> {
    // Datos hardcodeados para prueba
    const mockCategories: Category[] = [
      { id: 1, name: "Computadoras", description: "Equipos de cómputo", isActive: true, createdAt: new Date() },
      { id: 2, name: "Accesorios", description: "Accesorios para computadoras", isActive: true, createdAt: new Date() },
      { id: 3, name: "Laptops", description: "Computadoras portátiles", isActive: true, createdAt: new Date() },
      { id: 4, name: "Desktops", description: "Computadoras de escritorio", isActive: true, createdAt: new Date() },
      { id: 5, name: "Mouse y Teclados", description: "Dispositivos de entrada", isActive: true, createdAt: new Date() }
    ];
    
    return of(mockCategories).pipe(delay(300));
  }

  // CRUD Methods
  createCategory(categoryData: CategoryFormData): Observable<Category> {
    // Simulate API call
    const newCategory: Category = {
      id: Date.now(), // Simple ID generation for mock
      name: categoryData.name,
      description: categoryData.description,
      isActive: categoryData.isActive,
      createdAt: new Date()
    };
    
    console.log('Creating category:', newCategory);
    return of(newCategory).pipe(delay(500));
  }

  updateCategory(id: number, categoryData: CategoryFormData): Observable<Category> {
    // Simulate API call
    const updatedCategory: Category = {
      id,
      name: categoryData.name,
      description: categoryData.description,
      isActive: categoryData.isActive,
      createdAt: new Date()
    };
    
    console.log('Updating category:', updatedCategory);
    return of(updatedCategory).pipe(delay(500));
  }

  deleteCategory(id: number): Observable<boolean> {
    // Simulate API call
    console.log('Deleting category with ID:', id);
    return of(true).pipe(delay(500));
  }
}

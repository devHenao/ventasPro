import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product, Category, ProductImage, ProductVariant } from '../../domain/entities/product.entity';

@Injectable({
  providedIn: 'root'
})
export class ProductRepositoryImpl extends ProductRepository {
  private categories: Category[] = [
    {
      id: 1,
      name: 'Laptops',
      slug: 'laptops',
      description: 'Laptops de última generación',
      imageUrl: 'assets/images/categories/laptops.jpg',
      isActive: true
    },
    {
      id: 2,
      name: 'Periféricos',
      slug: 'perifericos',
      description: 'Teclados, ratones y accesorios',
      imageUrl: 'assets/images/categories/peripherals.jpg',
      isActive: true
    }
  ];

  private products: Product[] = [
    {
      id: 1,
      sku: 'LP-DELL-XPS13',
      name: 'Laptop Dell XPS 13',
      slug: 'laptop-dell-xps-13',
      description: 'Laptop ultradelgada con procesador Intel i7 de 11va generación',
      shortDescription: 'Potente y portátil laptop para profesionales',
      price: 1299.99,
      originalPrice: 1399.99,
      discountPercentage: 7,
      stock: 15,
      rating: 4.8,
      reviewCount: 24,
      category: this.categories[0],
      images: [
        {
          id: 1,
          url: 'assets/images/products/dell-xps-13.jpg',
          altText: 'Laptop Dell XPS 13',
          isMain: true,
          order: 1
        }
      ],
      isFeatured: true,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      sku: 'MOU-LOG-MX3',
      name: 'Mouse Logitech MX Master 3',
      slug: 'mouse-logitech-mx-master-3',
      description: 'Mouse inalámbrico avanzado para productividad con desplazamiento ultrarrápido',
      shortDescription: 'El mejor mouse para productividad',
      price: 99.99,
      stock: 50,
      rating: 4.9,
      reviewCount: 156,
      category: this.categories[1],
      images: [
        {
          id: 2,
          url: 'assets/images/products/logitech-mx-master-3.jpg',
          altText: 'Mouse Logitech MX Master 3',
          isMain: true,
          order: 1
        }
      ],
      isFeatured: true,
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];

  getAll(): Observable<Product[]> {
    return of(this.products.filter(p => p.isActive));
  }

  getById(id: number): Observable<Product> {
    const product = this.products.find(p => p.id === id && p.isActive);
    if (!product) throw new Error('Product not found');
    return of(product);
  }

  getByCategoryId(categoryId: number): Observable<Product[]> {
    return of(
      this.products
        .filter(p => p.category.id === categoryId && p.isActive)
        .map(p => ({...p})) // Retornar copias para evitar mutaciones
    );
  }

  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    const newProduct: Product = {
      ...product,
      id: Math.max(0, ...this.products.map(p => p.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.push(newProduct);
    return of({...newProduct});
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updatedProduct = {
      ...this.products[index],
      ...product,
      id, // Asegurar que el ID no cambie
      updatedAt: new Date()
    };

    this.products[index] = updatedProduct;
    return of({...updatedProduct});
  }

  delete(id: number): Observable<void> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');

    this.products[index].isActive = false;
    return of(void 0);
  }
}

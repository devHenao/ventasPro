import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/entities/product.entity';

@Injectable({
  providedIn: 'root'
})
export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  execute(): Observable<Product[]> {
    return this.productRepository.getAll();
  }

  executeByCategory(categoryId: number): Observable<Product[]> {
    return this.productRepository.getByCategoryId(categoryId);
  }
}

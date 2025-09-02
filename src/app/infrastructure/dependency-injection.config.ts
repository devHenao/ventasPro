import { Provider } from '@angular/core';
import { UserRepository } from '../domain/repositories/user.repository';
import { ProductRepository } from '../domain/repositories/product.repository';
import { CategoryRepository } from '../domain/repositories/category.repository';
import { UserRepositoryImpl } from './repositories/user.repository.impl';
import { ProductRepositoryImpl } from './repositories/product.repository.impl';
import { CategoryRepositoryImpl } from './repositories/category.repository.impl';

export const REPOSITORY_PROVIDERS: Provider[] = [
  {
    provide: UserRepository,
    useClass: UserRepositoryImpl
  },
  {
    provide: ProductRepository,
    useClass: ProductRepositoryImpl
  },
  {
    provide: CategoryRepository,
    useClass: CategoryRepositoryImpl
  }
];

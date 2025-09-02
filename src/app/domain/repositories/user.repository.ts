import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';

export abstract class UserRepository {
  abstract login(username: string, password: string): Observable<{ user: User; token: string }>;
  abstract getById(id: number): Observable<User>;
  abstract getAll(): Observable<User[]>;
  abstract create(user: Omit<User, 'id' | 'createdAt'>): Observable<User>;
  abstract update(id: number, user: Partial<User>): Observable<User>;
  abstract delete(id: number): Observable<void>;
}

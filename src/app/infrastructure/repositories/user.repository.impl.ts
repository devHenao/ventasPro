import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class UserRepositoryImpl extends UserRepository {
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@ventaspro.com',
      role: 'Admin',
      isActive: true,
      createdAt: new Date('2024-01-01')
    },
    {
      id: 2,
      username: 'editor',
      email: 'editor@ventaspro.com',
      role: 'Editor',
      isActive: true,
      createdAt: new Date('2024-01-02')
    }
  ];

  login(username: string, password: string): Observable<{ user: User; token: string }> {
    const user = this.users.find(u => u.username === username && u.isActive);
    if (user && password === 'password123') {
      return of({
        user,
        token: 'mock-jwt-token-' + Date.now()
      });
    }
    throw new Error('Invalid credentials');
  }

  getById(id: number): Observable<User> {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    return of(user);
  }

  getAll(): Observable<User[]> {
    return of(this.users);
  }

  create(user: Omit<User, 'id' | 'createdAt'>): Observable<User> {
    const newUser: User = {
      ...user,
      id: Math.max(...this.users.map(u => u.id)) + 1,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return of(newUser);
  }

  update(id: number, userData: Partial<User>): Observable<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users[index] = { ...this.users[index], ...userData };
    return of(this.users[index]);
  }

  delete(id: number): Observable<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users.splice(index, 1);
    return of(void 0);
  }
}

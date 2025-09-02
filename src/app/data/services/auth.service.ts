import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
    expiresAt: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'http://10.72.5.55:5262/api/auth';

  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);
  private isAuthenticated = signal(false);

  // Computed values
  user = this.currentUser.asReadonly();
  authenticated = this.isAuthenticated.asReadonly();

  constructor() {
    this.loadAuthState();
  }

  private loadAuthState() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.token.set(savedToken);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (e) {
        console.error('Error loading auth state:', e);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<boolean> {
    const loginData: LoginRequest = { email, password };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    return new Observable(observer => {
      this.http.post<LoginResponse>(`${this.API_URL}/login`, loginData, { headers }).pipe(
        catchError(error => {
          console.error('Login error:', error);
          observer.next(false);
          observer.complete();
          return of(null);
        })
      ).subscribe(response => {
        if (response && response.success) {
          this.token.set(response.data.token);
          this.currentUser.set(response.data.user);
          this.isAuthenticated.set(true);

          // Save to localStorage
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
          localStorage.setItem('tokenExpiry', response.data.expiresAt);

          observer.next(true);
        } else {
          observer.next(false);
        }
        observer.complete();
      });
    });
  }

  logout() {
    this.currentUser.set(null);
    this.token.set(null);
    this.isAuthenticated.set(false);

    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('tokenExpiry');

    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getToken(): string | null {
    return this.token();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }
}

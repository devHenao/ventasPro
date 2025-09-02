import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError, of, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../domain/entities/user.entity';

// Interface for decoded token
interface TokenPayload {
  sub: string; // user id
  email: string;
  role: string;
  exp: number; // expiration
  iat: number; // issued at
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  expiresIn?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal<boolean>(false);
  private http = inject(HttpClient);
  private router = inject(Router);

  // Storage keys
  private readonly TOKEN_KEY = 'ventaspro_token';
  private readonly USER_KEY = 'ventaspro_user';
  private readonly TOKEN_EXPIRY_KEY = 'ventaspro_token_expiry';

  // API endpoints
  private usersUrl = 'assets/data/users.json';

  // Public signals
  readonly currentUser$ = this.currentUser.asReadonly();
  readonly isAuthenticated$ = this.isAuthenticated.asReadonly();

  /**
   * Initialize authentication state from localStorage
   */
  initializeFromStorage(): void {
    if (this.isTokenExpired()) {
      this.logout(false);
      return;
    }

    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.setUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout(false);
      }
    }
  }

  /**
   * Login with username/email and password
   */
  login(username: string, password: string): Observable<LoginResponse> {
    console.log('Attempting login with:', { username });

    // Hardcoded users list
    const users = [
      {
        id: 1,
        username: 'admin',
        passwordHash: 'hashed_password_123',
        email: 'admin@ventaspro.com',
        role: 'Admin',
        isActive: true,
        name: 'Administrator'
      },
      {
        id: 2,
        username: 'editor',
        passwordHash: 'hashed_password_456',
        email: 'editor@ventaspro.com',
        role: 'Editor',
        isActive: true,
        name: 'Editor'
      }
    ];

    return of(users).pipe(
      map((users: any[]) => {
        // Find user by username or email
        const user = users.find((u: any) => 
          (u.username === username || u.email === username) &&
          u.passwordHash === `hashed_password_${password}` // In production, use proper hashing
        );

        if (!user) {
          console.log('No user found with credentials:', { username });
          throw new Error('Invalid credentials');
        }

        // Generate fake JWT token
        const token = this.generateFakeJWT(user);

        // Remove sensitive data from user object
        const { passwordHash, ...userData } = user;

        return {
          success: true,
          token,
          user: userData as User,
          expiresIn: 3600 // 1 hour in seconds
        };
      }),
      tap(response => {
        if (response.success && response.token) {
          this.handleSuccessfulLogin(response);
        }
      }),
      catchError(error => this.handleLoginError(error))
    );
  }

  /**
   * Logout the current user
   */
  logout(redirectToLogin: boolean = true): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);

    // Clear all auth data from storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);

    if (redirectToLogin) {
      this.router.navigate(['/login']);
    }
  }

  /**
   * Check if current user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  /**
   * Check if current user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Get the current auth token
   */
  getToken(): string | null {
    if (this.isTokenExpired()) {
      this.logout(false);
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Private helper methods
  private setUser(user: User): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;

    const expiryTime = parseInt(expiry, 10);
    return Date.now() >= expiryTime;
  }

  private handleSuccessfulLogin(response: LoginResponse): void {
    const expiryTime = Date.now() + (response.expiresIn || 3600) * 1000;

    // Save auth data to localStorage
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

    this.setUser(response.user);
  }

  private handleLoginError(error: any): Observable<LoginResponse> {
    console.error('Login error:', error);

    let errorMessage = 'Server connection error';
    if (error.status === 404) {
      errorMessage = 'Users file not found';
    } else if (error.status === 0) {
      errorMessage = 'Could not connect to server. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return of({
      success: false,
      error: errorMessage,
      token: '',
      user: null as any
    });
  }

  private generateFakeJWT(user: any): string {
    // In production, use a proper JWT library
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: TokenPayload = {
      sub: user.id || '1',
      email: user.email || '',
      role: user.role || 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    };

    // Encode to base64
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));

    // In production, this would be signed with a secret key
    const signature = 'simulated_signature';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}

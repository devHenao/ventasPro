import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../data/services/auth.service';
import { ProductsCrudComponent } from '../home/crud/products-crud/products-crud.component';
import { CategoriesCrudComponent } from '../home/crud/categories-crud/categories-crud.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductsCrudComponent, CategoriesCrudComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  user = signal<any>(null);
  activeSection = signal<string>('overview');
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Subscribe to the current user signal
    effect(() => {
      const currentUser = this.authService.user();
      if (currentUser) {
        this.user.set(currentUser);
      } else {
        // Redirect to login if no user is authenticated
        this.router.navigate(['/login']);
      }
    });
  }

  setActiveSection(section: string) {
    this.activeSection.set(section);
  }

  onLogout() {
    console.log('Logout clicked'); // Para debug
    this.authService.logout();
    // El AuthService ya maneja la navegación, pero por seguridad:
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 100);
  }
}

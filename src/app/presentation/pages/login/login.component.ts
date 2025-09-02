import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../data/services/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  // Credenciales reales para pruebas
  private testCredentials = {
    admin: { email: 'srendon@ofima.com', password: '123456' }
  };

  constructor() {
    this.loginForm = this.fb.group({
      email: [this.testCredentials.admin.email, [Validators.required, Validators.email]],
      password: [this.testCredentials.admin.password, Validators.required],
      rememberMe: [false]
    });

    // Verificar si hay una sesión activa
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/dashboard']);
    }
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password)
      .pipe(take(1))
      .subscribe({
        next: (success) => {
          if (success) {
            if (rememberMe) {
              // Guardar credenciales en localStorage si el usuario lo desea
              localStorage.setItem('rememberedEmail', email);
            } else {
              localStorage.removeItem('rememberedEmail');
            }

            this.router.navigate(['/admin/dashboard']);
          } else {
            this.errorMessage.set('Credenciales inválidas');
            this.isLoading.set(false);
          }
        },
        error: (error) => {
          console.error('Error en el login:', error);
          this.errorMessage.set('Error de conexión. Por favor, intente más tarde.');
          this.isLoading.set(false);
        }
      });
  }
}

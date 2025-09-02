import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../data/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Signals
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  changePasswordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  passwordMatchValidator(form: any) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmNewPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.changePasswordForm.valid) {
      this.isLoading.set(true);
      this.error.set(null);
      this.success.set(null);

      const { currentPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;

      this.authService.changePassword(currentPassword, newPassword, confirmNewPassword).subscribe({
        next: (success) => {
          this.isLoading.set(false);
          if (success) {
            this.success.set('Contraseña cambiada exitosamente');
            this.changePasswordForm.reset();
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 2000);
          } else {
            this.error.set('Error al cambiar la contraseña. Verifique sus datos.');
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Error de conexión. Intente nuevamente.');
          console.error('Change password error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.changePasswordForm.controls).forEach(key => {
      const control = this.changePasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    switch (field) {
      case 'current':
        this.showCurrentPassword.update(show => !show);
        break;
      case 'new':
        this.showNewPassword.update(show => !show);
        break;
      case 'confirm':
        this.showConfirmPassword.update(show => !show);
        break;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}

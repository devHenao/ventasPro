import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@Injectable({
  providedIn: 'root'
})
export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  execute(username: string, password: string): Observable<{ user: User; token: string }> {
    return this.userRepository.login(username, password);
  }
}

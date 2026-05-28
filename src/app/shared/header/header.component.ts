import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  imports: [NgIconComponent, RouterLink],
})
export class Header {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

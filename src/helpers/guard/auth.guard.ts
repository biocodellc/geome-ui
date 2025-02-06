import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const authGuard: CanActivateFn = () => {
  let authentication = inject(AuthenticationService);
  let router = inject(Router);

  if(authentication.isLoggedIn) return true;
  else{
    router.navigate(['/'])
    return false;
  }
};

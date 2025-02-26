import { inject, Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  // Injectors
  private authService = inject(AuthenticationService);
  
  download(urlString:string){
    const user = this.authService.getUserFromStorage();
    let access_token = user?.accessToken;
    let url:any = new URL(urlString);

    const parser:any = document.createElement('a');
    parser.href = url;

    if (access_token) {
      if (parser.search) {
        url += `&access_token=${access_token}`;
      } else {
        url += `?access_token=${access_token}`;
      }
    }
    window.open(url, '_self');
  }
}

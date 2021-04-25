import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FacebookService {

  constructor(
    private http: HttpClient
  ) { }

  getAudioLink(vidUrl: string) {
    var formData: any = new FormData();
    formData.append("url", vidUrl);
    return this.http.post('https://cors.filavents.com/https://www.getfvid.com/downloader', formData, {
      observe: 'response',
      responseType: 'text',
    });
  }
}

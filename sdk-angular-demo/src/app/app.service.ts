import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environment';

@Injectable()
export class AnalyzeService {
  constructor(private http: HttpClient) { }


  performLivenessAnalysis(selfie: Blob, metadata: string) {
    
    const payload = new FormData();

    


    return this.http.post<any>(environment.apiAnalyzeUrl, metadata, {
         headers: new HttpHeaders({
            Authorization: environment.apiKey
        })
    })
  }
}
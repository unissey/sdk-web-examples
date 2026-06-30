import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { appConfig } from './app.config';

@Injectable()
export class AnalyzeService {
  constructor(private http: HttpClient) { }


  performLivenessAnalysis(selfie: Blob, metadata: string) {
    
    const payload = new FormData();
    payload.append("selfie", selfie);
    payload.append("selfie-metadata", metadata);

    return this.http.post<any>("https://test.api-analyze.unissey.com/api/v3/analyze", payload, {
         headers: new HttpHeaders({
            Authorization: appConfig.apiKey
        })
    })
  }

  performIadPrepare(): Observable<string> {
    const url = `https://api.test.unissey.com/iad/v3/prepare`;
    return this.http.post(url, {}, {
      responseType: "text",
      headers: new HttpHeaders({
        Authorization: appConfig.apiKey,
      })
    })
  }
}